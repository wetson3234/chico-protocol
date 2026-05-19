/**
 * Chico Protocol — Script de verification navigateur automatique
 *
 * Ce script lance le dev server, navigue sur chaque page du projet,
 * et capture toutes les erreurs runtime :
 * - Console errors/warnings
 * - Network errors (4xx, 5xx)
 * - JavaScript exceptions
 * - Screenshots de chaque page
 * - Elements interactifs morts (boutons sans handler, formulaires sans action)
 *
 * Usage : node .claude/scripts/browser-verify.mjs [--port 3000] [--base-url http://localhost:3000]
 *
 * Prerequis : npm install -D playwright @playwright/test
 *             npx playwright install chromium
 *
 * Sortie : _chico-output/reports/browser-report.json + screenshots dans _chico-output/reports/screenshots/
 */

import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, '_chico-output', 'reports');
const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots');

// --- Configuration ---
const CONFIG = {
  baseUrl: process.argv.includes('--base-url')
    ? process.argv[process.argv.indexOf('--base-url') + 1]
    : 'http://localhost:3000',
  port: process.argv.includes('--port')
    ? parseInt(process.argv[process.argv.indexOf('--port') + 1])
    : 3000,
  timeout: 15000,        // Timeout par page en ms
  waitAfterNav: 3000,    // Attente apres navigation pour laisser les API repondre
  maxPages: 50,          // Max pages a tester
  headless: true,
  viewport: { width: 1920, height: 1080 },
};

// --- Structures de donnees ---
const report = {
  timestamp: new Date().toISOString(),
  baseUrl: CONFIG.baseUrl,
  pages: [],
  summary: {
    totalPages: 0,
    pagesWithErrors: 0,
    totalConsoleErrors: 0,
    totalNetworkErrors: 0,
    totalJsExceptions: 0,
    totalDeadElements: 0,
    criticalIssues: [],
  },
};

// --- Utilitaires ---
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(url) {
  return url.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 100);
}

// --- Decouverte des pages depuis le code source ---
function discoverPages() {
  const pages = new Set();
  const srcApp = path.join(PROJECT_ROOT, 'src', 'app');

  if (!fs.existsSync(srcApp)) {
    console.error('Dossier src/app/ introuvable');
    return ['/'];
  }

  function scanDir(dir, routePrefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('_') || entry.name === 'api' || entry.name === 'node_modules') continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Groupes de routes (auth), (dashboard), etc.
        let newPrefix = routePrefix;
        if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
          // Groupe de route — ne change pas l'URL
          newPrefix = routePrefix;
        } else if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          // Route dynamique — utiliser un placeholder
          newPrefix = `${routePrefix}/${entry.name.replace(/\[|\]/g, '')}`;
        } else {
          newPrefix = `${routePrefix}/${entry.name}`;
        }
        scanDir(fullPath, newPrefix);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts' || entry.name === 'page.jsx' || entry.name === 'page.js') {
        const route = routePrefix || '/';
        pages.add(route);
      }
    }
  }

  scanDir(srcApp, '');

  // Ajouter la racine si pas detectee
  pages.add('/');

  return Array.from(pages).sort();
}

// --- Recuperer les routes dynamiques avec des IDs reels depuis la DB ou l'API ---
async function resolveDynamicRoutes(page, routes) {
  const resolvedRoutes = [];

  for (const route of routes) {
    if (!route.includes('[') && !route.match(/\/[a-z]+Id$/)) {
      resolvedRoutes.push(route);
      continue;
    }

    // Pour les routes dynamiques, on essaie d'abord la version parente
    // Par exemple /app/projects/projectId → on va chercher un vrai ID via /api/projects
    const parentRoute = route.split('/').slice(0, -1).join('/');
    if (parentRoute && !resolvedRoutes.includes(parentRoute)) {
      resolvedRoutes.push(parentRoute);
    }

    // On garde aussi la route dynamique pour tenter avec l'API
    resolvedRoutes.push(route);
  }

  return [...new Set(resolvedRoutes)];
}

// --- Test d'une page ---
async function testPage(page, url, routePath) {
  const pageReport = {
    route: routePath,
    url: url,
    status: 'ok',
    httpStatus: null,
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    jsExceptions: [],
    deadElements: [],
    screenshot: null,
    loadTime: null,
  };

  const consoleMessages = [];
  const networkRequests = [];
  const jsErrors = [];

  // Ecouter les messages console
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    // Ignorer les messages de dev courants
    if (text.includes('[next-auth]') && text.includes('DEBUG_ENABLED')) return;
    if (text.includes('prisma:query')) return;
    if (text.includes('Download the React DevTools')) return;
    if (text.includes('[HMR]')) return;
    if (text.includes('Fast Refresh')) return;

    if (type === 'error') {
      pageReport.consoleErrors.push({
        message: text.slice(0, 500),
        timestamp: new Date().toISOString(),
      });
    } else if (type === 'warning') {
      pageReport.consoleWarnings.push({
        message: text.slice(0, 500),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Ecouter les erreurs JS non capturees
  page.on('pageerror', (error) => {
    pageReport.jsExceptions.push({
      message: error.message.slice(0, 500),
      stack: (error.stack || '').slice(0, 1000),
      timestamp: new Date().toISOString(),
    });
  });

  // Ecouter les reponses reseau
  page.on('response', (response) => {
    const status = response.status();
    const reqUrl = response.url();

    // Ignorer les ressources statiques et les requetes internes Next.js
    if (reqUrl.includes('_next/') || reqUrl.includes('favicon') || reqUrl.includes('.hot-update')) return;

    if (status >= 400) {
      pageReport.networkErrors.push({
        url: reqUrl.slice(0, 300),
        method: response.request().method(),
        status: status,
        statusText: response.statusText(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  try {
    const startTime = Date.now();

    // Naviguer vers la page
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });

    pageReport.httpStatus = response ? response.status() : null;

    // Attendre que les API repondent
    await page.waitForTimeout(CONFIG.waitAfterNav);

    pageReport.loadTime = Date.now() - startTime;

    // Verifier si c'est une page 404
    const is404 = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('404') && text.includes('not found');
    });

    if (is404 || pageReport.httpStatus === 404) {
      pageReport.status = 'error';
      pageReport.consoleErrors.push({
        message: `Page 404 : ${routePath}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Scanner les elements interactifs morts
    const deadElements = await page.evaluate(() => {
      const dead = [];

      // Boutons sans onclick reel
      document.querySelectorAll('button').forEach((btn, i) => {
        const hasClick = btn.onclick !== null ||
                        btn.getAttribute('onclick') !== null ||
                        btn.closest('form') !== null ||
                        btn.closest('[data-radix-collection-item]') !== null ||
                        btn.getAttribute('type') === 'submit' ||
                        btn.getAttribute('aria-expanded') !== null ||
                        btn.getAttribute('role') === 'tab' ||
                        btn.closest('a') !== null;

        // Verifier les React event handlers (ils sont dans les proprietes internes)
        const reactProps = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactFiber'));
        const hasReactHandler = reactProps ? !!btn[reactProps]?.onClick : false;

        if (!hasClick && !hasReactHandler && btn.innerText.trim()) {
          dead.push({
            type: 'button',
            text: btn.innerText.trim().slice(0, 50),
            selector: `button:nth-of-type(${i + 1})`,
            issue: 'Pas de handler onClick detecte',
          });
        }
      });

      // Liens morts (href="#" ou href="")
      document.querySelectorAll('a').forEach((link, i) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '' || href === 'javascript:void(0)') {
          dead.push({
            type: 'link',
            text: link.innerText.trim().slice(0, 50),
            href: href,
            selector: `a:nth-of-type(${i + 1})`,
            issue: `Lien mort : href="${href}"`,
          });
        }
      });

      // Formulaires sans action
      document.querySelectorAll('form').forEach((form, i) => {
        const hasAction = form.getAttribute('action') !== null;
        const hasOnSubmit = form.onsubmit !== null || form.getAttribute('onsubmit') !== null;
        const reactProps = Object.keys(form).find(k => k.startsWith('__reactProps'));
        const hasReactSubmit = reactProps ? !!form[reactProps]?.onSubmit : false;

        if (!hasAction && !hasOnSubmit && !hasReactSubmit) {
          dead.push({
            type: 'form',
            selector: `form:nth-of-type(${i + 1})`,
            issue: 'Formulaire sans onSubmit detecte',
          });
        }
      });

      // Images cassees
      document.querySelectorAll('img').forEach((img, i) => {
        if (img.naturalWidth === 0 && img.complete && img.src && !img.src.includes('data:')) {
          dead.push({
            type: 'image',
            src: img.src.slice(0, 200),
            selector: `img:nth-of-type(${i + 1})`,
            issue: 'Image cassee (ne charge pas)',
          });
        }
      });

      return dead;
    });

    pageReport.deadElements = deadElements;

    // Screenshot
    const screenshotName = `${slugify(routePath)}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    pageReport.screenshot = `screenshots/${screenshotName}`;

    // Determiner le statut global de la page
    if (pageReport.consoleErrors.length > 0 || pageReport.jsExceptions.length > 0 || pageReport.networkErrors.length > 0 || pageReport.deadElements.length > 0) {
      pageReport.status = 'error';
    }

  } catch (error) {
    pageReport.status = 'error';
    pageReport.consoleErrors.push({
      message: `Erreur navigation : ${error.message}`.slice(0, 500),
      timestamp: new Date().toISOString(),
    });
  }

  // Cleanup listeners
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.removeAllListeners('response');

  return pageReport;
}

// --- Test d'un flux interactif ---
async function testInteractiveFlow(page, flowName, steps) {
  const flowReport = {
    name: flowName,
    status: 'ok',
    steps: [],
    errors: [],
  };

  for (const step of steps) {
    try {
      const stepResult = { name: step.name, status: 'ok', details: '' };

      if (step.navigate) {
        await page.goto(`${CONFIG.baseUrl}${step.navigate}`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
        stepResult.details = `Navigated to ${step.navigate}`;
      }

      if (step.click) {
        await page.click(step.click, { timeout: 5000 });
        stepResult.details += ` → Clicked ${step.click}`;
        await page.waitForTimeout(1000);
      }

      if (step.fill) {
        for (const [selector, value] of Object.entries(step.fill)) {
          await page.fill(selector, value, { timeout: 5000 });
        }
        stepResult.details += ` → Filled ${Object.keys(step.fill).length} fields`;
      }

      if (step.submit) {
        await page.click(step.submit, { timeout: 5000 });
        await page.waitForTimeout(2000);
        stepResult.details += ` → Submitted`;
      }

      if (step.expectUrl) {
        const currentUrl = page.url();
        if (!currentUrl.includes(step.expectUrl)) {
          stepResult.status = 'error';
          stepResult.details += ` → Expected URL containing "${step.expectUrl}", got "${currentUrl}"`;
        }
      }

      if (step.expectSelector) {
        try {
          await page.waitForSelector(step.expectSelector, { timeout: 5000 });
          stepResult.details += ` → Found ${step.expectSelector}`;
        } catch {
          stepResult.status = 'error';
          stepResult.details += ` → Selector "${step.expectSelector}" not found`;
        }
      }

      flowReport.steps.push(stepResult);

      if (stepResult.status === 'error') {
        flowReport.status = 'error';
        flowReport.errors.push(`Step "${step.name}": ${stepResult.details}`);
      }

    } catch (error) {
      flowReport.status = 'error';
      flowReport.steps.push({ name: step.name, status: 'error', details: error.message.slice(0, 300) });
      flowReport.errors.push(`Step "${step.name}": ${error.message.slice(0, 300)}`);
      break; // Arreter le flux si une etape echoue
    }
  }

  return flowReport;
}

// --- Main ---
async function main() {
  console.log('=== Chico Protocol — Verification Navigateur ===\n');

  ensureDir(REPORTS_DIR);
  ensureDir(SCREENSHOTS_DIR);

  // Decouvrir les pages
  const routes = discoverPages();
  console.log(`Pages decouvertes : ${routes.length}`);
  routes.forEach(r => console.log(`  ${r}`));

  // Verifier si le serveur tourne deja
  let serverProcess = null;
  let serverStarted = false;

  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/auth/session`);
    serverStarted = true;
    console.log('\nServeur deja en cours sur', CONFIG.baseUrl);
  } catch {
    console.log('\nDemarrage du serveur de dev...');
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      shell: true,
    });

    // Attendre que le serveur soit pret
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout demarrage serveur')), 60000);

      serverProcess.stdout.on('data', (data) => {
        const text = data.toString();
        if (text.includes('Ready in') || text.includes('ready on')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const text = data.toString();
        if (text.includes('Ready in') || text.includes('ready on')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Laisser le serveur se stabiliser
    await new Promise(r => setTimeout(r, 3000));
    serverStarted = true;
    console.log('Serveur pret.');
  }

  // Lancer Playwright
  console.log('\nLancement du navigateur...');
  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    ignoreHTTPSErrors: true,
  });

  // Creer une session (essayer de se connecter d'abord)
  const loginPage = await context.newPage();
  try {
    // Tenter un login pour avoir acces aux pages protegees
    await loginPage.goto(`${CONFIG.baseUrl}/auth/login`, { waitUntil: 'networkidle', timeout: 10000 });

    // Essayer de remplir un formulaire de login si present
    const emailInput = await loginPage.$('input[type="email"], input[name="email"]');
    const passwordInput = await loginPage.$('input[type="password"], input[name="password"]');

    if (emailInput && passwordInput) {
      await emailInput.fill('admin@example.com');
      await passwordInput.fill('admin123');

      const submitBtn = await loginPage.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await loginPage.waitForTimeout(3000);
        console.log('Login tente avec admin@example.com');
      }
    }
  } catch (e) {
    console.log('Login auto echoue (normal si pas de page login standard):', e.message.slice(0, 100));
  }
  await loginPage.close();

  // Tester chaque page
  console.log(`\nTest de ${routes.length} pages...\n`);

  for (const route of routes.slice(0, CONFIG.maxPages)) {
    const url = `${CONFIG.baseUrl}${route}`;
    const page = await context.newPage();

    process.stdout.write(`  Testing ${route} ... `);
    const pageReport = await testPage(page, url, route);
    report.pages.push(pageReport);

    const errorCount = pageReport.consoleErrors.length + pageReport.networkErrors.length + pageReport.jsExceptions.length + pageReport.deadElements.length;
    if (errorCount > 0) {
      console.log(`ERREURS (${errorCount})`);
      pageReport.consoleErrors.forEach(e => console.log(`    [CONSOLE] ${e.message.slice(0, 120)}`));
      pageReport.networkErrors.forEach(e => console.log(`    [NETWORK] ${e.method} ${e.url.slice(0, 80)} → ${e.status}`));
      pageReport.jsExceptions.forEach(e => console.log(`    [JS] ${e.message.slice(0, 120)}`));
      pageReport.deadElements.forEach(e => console.log(`    [DEAD] ${e.type}: ${e.issue}`));
    } else {
      console.log('OK');
    }

    await page.close();
  }

  // Test des flux interactifs de base
  console.log('\nTest des flux interactifs...\n');

  const flowsPage = await context.newPage();

  // Flux : Navigation landing page
  const landingFlow = await testInteractiveFlow(flowsPage, 'Navigation Landing', [
    { name: 'Ouvrir landing', navigate: '/' },
    { name: 'Verifier hero', expectSelector: 'h1, [class*="hero"]' },
  ]);
  report.flows = report.flows || [];
  report.flows.push(landingFlow);
  console.log(`  Landing: ${landingFlow.status}`);

  // Flux : Page login accessible
  const loginFlow = await testInteractiveFlow(flowsPage, 'Acces Login', [
    { name: 'Ouvrir login', navigate: '/auth/login' },
    { name: 'Formulaire present', expectSelector: 'form, input[type="email"], input[name="email"]' },
  ]);
  report.flows.push(loginFlow);
  console.log(`  Login: ${loginFlow.status}`);

  // Flux : Page register accessible
  const registerFlow = await testInteractiveFlow(flowsPage, 'Acces Register', [
    { name: 'Ouvrir register', navigate: '/auth/register' },
    { name: 'Formulaire present', expectSelector: 'form, input[type="email"], input[name="email"]' },
  ]);
  report.flows.push(registerFlow);
  console.log(`  Register: ${registerFlow.status}`);

  await flowsPage.close();

  // Generer le resume
  report.summary.totalPages = report.pages.length;
  report.summary.pagesWithErrors = report.pages.filter(p => p.status === 'error').length;
  report.summary.totalConsoleErrors = report.pages.reduce((sum, p) => sum + p.consoleErrors.length, 0);
  report.summary.totalNetworkErrors = report.pages.reduce((sum, p) => sum + p.networkErrors.length, 0);
  report.summary.totalJsExceptions = report.pages.reduce((sum, p) => sum + p.jsExceptions.length, 0);
  report.summary.totalDeadElements = report.pages.reduce((sum, p) => sum + p.deadElements.length, 0);

  // Identifier les issues critiques
  for (const p of report.pages) {
    for (const ne of p.networkErrors) {
      if (ne.status >= 500) {
        report.summary.criticalIssues.push({
          type: 'server_error',
          page: p.route,
          detail: `${ne.method} ${ne.url} → ${ne.status}`,
        });
      }
    }
    for (const je of p.jsExceptions) {
      report.summary.criticalIssues.push({
        type: 'js_exception',
        page: p.route,
        detail: je.message.slice(0, 200),
      });
    }
    for (const ne of p.networkErrors) {
      if (ne.status >= 400 && ne.status < 500) {
        report.summary.criticalIssues.push({
          type: 'api_error',
          page: p.route,
          detail: `${ne.method} ${ne.url} → ${ne.status}`,
        });
      }
    }
  }

  // Sauvegarder le rapport
  const reportPath = path.join(REPORTS_DIR, 'browser-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generer aussi un resume lisible
  const readablePath = path.join(REPORTS_DIR, 'browser-report.md');
  let md = `# Rapport Verification Navigateur\n\n`;
  md += `Date : ${report.timestamp}\n`;
  md += `URL : ${report.baseUrl}\n\n`;
  md += `## Resume\n\n`;
  md += `| Metrique | Valeur |\n|----------|--------|\n`;
  md += `| Pages testees | ${report.summary.totalPages} |\n`;
  md += `| Pages avec erreurs | ${report.summary.pagesWithErrors} |\n`;
  md += `| Erreurs console | ${report.summary.totalConsoleErrors} |\n`;
  md += `| Erreurs reseau (4xx/5xx) | ${report.summary.totalNetworkErrors} |\n`;
  md += `| Exceptions JS | ${report.summary.totalJsExceptions} |\n`;
  md += `| Elements morts | ${report.summary.totalDeadElements} |\n\n`;

  if (report.summary.criticalIssues.length > 0) {
    md += `## Issues Critiques\n\n`;
    for (const issue of report.summary.criticalIssues) {
      md += `- **[${issue.type.toUpperCase()}]** ${issue.page} : ${issue.detail}\n`;
    }
    md += '\n';
  }

  md += `## Detail par page\n\n`;
  for (const p of report.pages) {
    const icon = p.status === 'ok' ? 'OK' : 'ERREUR';
    md += `### ${p.route} — ${icon}\n`;
    if (p.consoleErrors.length) {
      md += `Console errors :\n`;
      p.consoleErrors.forEach(e => { md += `- ${e.message.slice(0, 200)}\n`; });
    }
    if (p.networkErrors.length) {
      md += `Network errors :\n`;
      p.networkErrors.forEach(e => { md += `- ${e.method} ${e.url.slice(0, 150)} → ${e.status}\n`; });
    }
    if (p.jsExceptions.length) {
      md += `JS exceptions :\n`;
      p.jsExceptions.forEach(e => { md += `- ${e.message.slice(0, 200)}\n`; });
    }
    if (p.deadElements.length) {
      md += `Elements morts :\n`;
      p.deadElements.forEach(e => { md += `- [${e.type}] ${e.issue}\n`; });
    }
    if (p.status === 'ok') md += `Aucune erreur\n`;
    md += '\n';
  }

  if (report.flows?.length) {
    md += `## Flux interactifs\n\n`;
    for (const f of report.flows) {
      md += `### ${f.name} — ${f.status.toUpperCase()}\n`;
      f.steps.forEach(s => { md += `- ${s.name} : ${s.status} ${s.details || ''}\n`; });
      if (f.errors.length) {
        md += `Erreurs :\n`;
        f.errors.forEach(e => { md += `- ${e}\n`; });
      }
      md += '\n';
    }
  }

  fs.writeFileSync(readablePath, md);

  // Affichage final
  console.log('\n=== RESUME ===\n');
  console.log(`Pages testees     : ${report.summary.totalPages}`);
  console.log(`Pages OK          : ${report.summary.totalPages - report.summary.pagesWithErrors}`);
  console.log(`Pages en erreur   : ${report.summary.pagesWithErrors}`);
  console.log(`Erreurs console   : ${report.summary.totalConsoleErrors}`);
  console.log(`Erreurs reseau    : ${report.summary.totalNetworkErrors}`);
  console.log(`Exceptions JS     : ${report.summary.totalJsExceptions}`);
  console.log(`Elements morts    : ${report.summary.totalDeadElements}`);
  console.log(`Issues critiques  : ${report.summary.criticalIssues.length}`);
  console.log(`\nRapport : ${reportPath}`);
  console.log(`Resume  : ${readablePath}`);
  console.log(`Screenshots : ${SCREENSHOTS_DIR}`);

  // Cleanup
  await browser.close();

  if (serverProcess) {
    console.log('\nArret du serveur de dev...');
    serverProcess.kill('SIGTERM');
  }

  // Exit code basé sur les erreurs
  process.exit(report.summary.criticalIssues.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Erreur fatale :', error.message);
  process.exit(2);
});
