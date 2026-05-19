"""Configuration loader for Chico RAG MCP."""
from __future__ import annotations
import os
import re
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv


def _slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:60] or "default"


@dataclass(frozen=True)
class Config:
    # Qdrant
    qdrant_host: str
    qdrant_port: int
    qdrant_api_key: str
    # SSH tunnel
    ssh_tunnel_enabled: bool
    ssh_host: str
    ssh_user: str
    ssh_key_path: str
    ssh_remote_host: str
    ssh_remote_port: int
    ssh_local_bind_port: int
    # Embeddings
    embedding_model: str
    embedding_dimension: int
    embedding_device: str
    # Chunking
    chunk_size_tokens: int
    chunk_overlap_tokens: int
    # Collection
    collection_prefix: str
    collection_name: str
    # Misc
    log_level: str
    project_root: Path


def load_config() -> Config:
    """Load config from .env (next to pyproject.toml) + os.environ overrides."""
    here = Path(__file__).resolve().parent.parent
    env_file = here / ".env"
    if env_file.exists():
        load_dotenv(env_file)

    project_root = Path(os.getenv("CHICO_PROJECT_ROOT", os.getcwd())).resolve()

    project_slug = _slugify(project_root.name)
    prefix = os.getenv("COLLECTION_PREFIX", "chico")
    collection_name = os.getenv("COLLECTION_NAME", f"{prefix}-{project_slug}")

    return Config(
        qdrant_host=os.getenv("QDRANT_HOST", "127.0.0.1"),
        qdrant_port=int(os.getenv("QDRANT_PORT", "6333")),
        qdrant_api_key=os.getenv("QDRANT_API_KEY", ""),
        ssh_tunnel_enabled=os.getenv("SSH_TUNNEL_ENABLED", "true").lower() == "true",
        ssh_host=os.getenv("SSH_HOST", ""),
        ssh_user=os.getenv("SSH_USER", "ubuntu"),
        ssh_key_path=os.getenv("SSH_KEY_PATH", ""),
        ssh_remote_host=os.getenv("SSH_REMOTE_HOST", "127.0.0.1"),
        ssh_remote_port=int(os.getenv("SSH_REMOTE_PORT", "6333")),
        ssh_local_bind_port=int(os.getenv("SSH_LOCAL_BIND_PORT", "6333")),
        embedding_model=os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5"),
        embedding_dimension=int(os.getenv("EMBEDDING_DIMENSION", "1024")),
        embedding_device=os.getenv("EMBEDDING_DEVICE", "cpu"),
        chunk_size_tokens=int(os.getenv("CHUNK_SIZE_TOKENS", "500")),
        chunk_overlap_tokens=int(os.getenv("CHUNK_OVERLAP_TOKENS", "50")),
        collection_prefix=prefix,
        collection_name=collection_name,
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        project_root=project_root,
    )
