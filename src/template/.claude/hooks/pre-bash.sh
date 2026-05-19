#!/usr/bin/env bash
# =============================================================================
# PRE-BASH HOOK — Chico Protocol
# S'exécute avant chaque commande bash
# =============================================================================

set -euo pipefail

COMMAND="${1:-}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_DIR="$(dirname "$0")/../../_chico-output/reports"
BASH_LOG="$LOG_DIR/bash-log.md"

mkdir -p "$LOG_DIR"

# Initialiser le log si nécessaire
if [ ! -f "$BASH_LOG" ]; then
  cat > "$BASH_LOG" <<'HEADER'
# Journal des commandes Bash

| Date | Commande | Statut |
|------|----------|--------|
HEADER
fi

if [ -z "$COMMAND" ]; then
  exit 0
fi

# --- Détection des commandes dangereuses ---
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf /*"
  "DROP DATABASE"
  "DROP TABLE"
  "DROP SCHEMA"
  "truncate"
  ":(){ :|:& };:"
  "mkfs"
  "> /dev/sda"
  "dd if=/dev/zero"
  "chmod -R 777 /"
)

COMMAND_UPPER=$(echo "$COMMAND" | tr '[:lower:]' '[:upper:]')

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  PATTERN_UPPER=$(echo "$pattern" | tr '[:lower:]' '[:upper:]')
  if [[ "$COMMAND_UPPER" == *"$PATTERN_UPPER"* ]]; then
    echo "============================================================"
    echo "🚫 COMMANDE DANGEREUSE BLOQUÉE"
    echo "============================================================"
    echo ""
    echo "Commande détectée : $COMMAND"
    echo "Motif dangereux   : $pattern"
    echo ""
    echo "Cette commande peut causer des dommages irréversibles."
    echo "Si vous êtes certain de vouloir l'exécuter, modifiez-la"
    echo "pour être plus spécifique (ex: rm -rf ./dossier-cible)."
    echo ""
    echo "| $TIMESTAMP | $COMMAND | BLOQUÉE — motif: $pattern |" >> "$BASH_LOG"
    exit 1
  fi
done

# --- Logger la commande ---
# Tronquer les commandes trop longues pour le log
CMD_SHORT="${COMMAND:0:120}"
if [ ${#COMMAND} -gt 120 ]; then
  CMD_SHORT="${CMD_SHORT}..."
fi
echo "| $TIMESTAMP | \`${CMD_SHORT}\` | AUTORISÉE |" >> "$BASH_LOG"

# --- Avertissement pour npm install / pip install ---
if [[ "$COMMAND" == *"npm install"* ]] || [[ "$COMMAND" == *"npm i "* ]]; then
  # Vérifier la présence d'un lockfile
  if [ -f "package-lock.json" ]; then
    echo "⚠ ATTENTION : package-lock.json détecté."
    echo "  → Préférez 'npm ci' pour respecter le lockfile."
    echo "  → 'npm install' peut modifier package-lock.json."
  fi
  if [ -f "pnpm-lock.yaml" ]; then
    echo "⚠ ATTENTION : pnpm-lock.yaml détecté."
    echo "  → Utilisez 'pnpm install --frozen-lockfile' en CI."
  fi
  if [ -f "yarn.lock" ]; then
    echo "⚠ ATTENTION : yarn.lock détecté."
    echo "  → Utilisez 'yarn install --frozen-lockfile' en CI."
  fi
  if [ -f "bun.lockb" ]; then
    echo "⚠ ATTENTION : bun.lockb détecté."
    echo "  → Utilisez 'bun install --frozen-lockfile' en CI."
  fi
fi

if [[ "$COMMAND" == *"pip install"* ]]; then
  if [ -f "requirements.txt" ]; then
    echo "⚠ ATTENTION : requirements.txt détecté."
    echo "  → Pensez à mettre à jour requirements.txt après installation."
  fi
  if [ -f "Pipfile.lock" ]; then
    echo "⚠ ATTENTION : Pipfile.lock détecté."
    echo "  → Préférez 'pipenv install' pour respecter le lockfile."
  fi
  if [ -f "poetry.lock" ]; then
    echo "⚠ ATTENTION : poetry.lock détecté."
    echo "  → Préférez 'poetry add' pour gérer les dépendances."
  fi
fi

exit 0
