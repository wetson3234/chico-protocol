#!/usr/bin/env bash
# =============================================================================
#  install.sh — Installation initiale du MCP chico-rag
# =============================================================================
#  Crée un venv centralisé dans ~/.chico-rag/ qui sera partagé par tous les
#  projets équipés. Le modèle bge-large (~1.3 GB) est téléchargé une seule
#  fois au premier appel, puis caché par HuggingFace dans ~/.cache/huggingface/.
# =============================================================================

set -euo pipefail

CENTRAL_DIR="${HOME}/.chico-rag"
VENV_DIR="${CENTRAL_DIR}/venv"
MCP_CODE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Chico RAG MCP — installation ==="
echo "Code MCP    : $MCP_CODE_DIR"
echo "Venv central : $VENV_DIR"
echo

# --- Python ---
if ! command -v python >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
  echo "[ERREUR] Python 3.10+ n'est pas installé. Installe-le depuis python.org" >&2
  exit 1
fi
PY="$(command -v python3 || command -v python)"
echo "[OK] Python : $($PY --version)"

# --- Venv central ---
if [ ! -d "$VENV_DIR" ]; then
  mkdir -p "$CENTRAL_DIR"
  echo "[INFO] Création du venv central…"
  "$PY" -m venv "$VENV_DIR"
fi

# Path Python du venv (cross-platform)
if [ -f "$VENV_DIR/Scripts/python.exe" ]; then
  VENV_PY="$VENV_DIR/Scripts/python.exe"
elif [ -f "$VENV_DIR/bin/python" ]; then
  VENV_PY="$VENV_DIR/bin/python"
else
  echo "[ERREUR] Python du venv introuvable" >&2
  exit 1
fi
echo "[OK] Python venv : $VENV_PY"

# --- Pip + install ---
echo "[INFO] Mise à jour de pip…"
"$VENV_PY" -m pip install --upgrade pip --quiet

echo "[INFO] Installation des dépendances (peut prendre quelques minutes)…"
"$VENV_PY" -m pip install -e "$MCP_CODE_DIR" --quiet

# --- .env ---
ENV_FILE="$MCP_CODE_DIR/.env"
ENV_EXAMPLE="$MCP_CODE_DIR/.env.example"
if [ ! -f "$ENV_FILE" ]; then
  echo "[INFO] Création de .env depuis .env.example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "       → Vérifie SSH_KEY_PATH dans $ENV_FILE"
fi

# --- Récap ---
echo
echo "=== Installation terminée ==="
echo
echo "Pour configurer Claude Code, ajoute ce bloc à .claude/settings.json :"
echo
cat <<EOF
{
  "mcpServers": {
    "chico-rag": {
      "command": "$VENV_PY",
      "args": ["-m", "chico_rag.server"],
      "cwd": "$MCP_CODE_DIR"
    }
  }
}
EOF
echo
echo "Note : le modèle bge-large (~1.3 GB) sera téléchargé au premier appel."
