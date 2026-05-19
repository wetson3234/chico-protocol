"""Chico RAG MCP server — exposes semantic memory tools to Claude Code."""
from __future__ import annotations
import logging
import sys
import asyncio
from pathlib import Path
from typing import List, Optional

from mcp.server.fastmcp import FastMCP

from .config import load_config
from .embeddings import Embedder
from .qdrant_backend import QdrantBackend
from .ssh_tunnel import TunnelManager


# ---------- bootstrap ----------

CFG = load_config()
logging.basicConfig(
    level=getattr(logging, CFG.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,  # NEVER stdout — MCP uses stdout for JSON-RPC
)
log = logging.getLogger(__name__)

TUNNEL = TunnelManager(CFG)
LOCAL_PORT = TUNNEL.start()
EMBEDDER = Embedder(CFG)
BACKEND = QdrantBackend(CFG, LOCAL_PORT, EMBEDDER)

mcp = FastMCP("chico-rag")


# ---------- tools ----------

@mcp.tool()
def chico_memory_index(
    path: str,
    tags: Optional[List[str]] = None,
    collection: Optional[str] = None,
) -> dict:
    """Index a file or a directory into the semantic memory.

    Args:
        path: absolute or project-relative path (file or directory).
        tags: optional list of tags for later filtering.
        collection: optional collection name (defaults to project's auto-detected).

    Returns:
        Dict with chunks indexed, files processed, errors, and the collection used.
    """
    p = Path(path).expanduser()
    if not p.is_absolute():
        p = (CFG.project_root / p).resolve()
    if not p.exists():
        return {"error": f"path not found: {p}"}
    if p.is_file():
        return BACKEND.index_file(p, tags=tags, collection=collection)
    return BACKEND.index_directory(p, tags=tags, collection=collection)


@mcp.tool()
def chico_memory_search(
    query: str,
    k: int = 5,
    collection: Optional[str] = None,
    filter_path_prefix: Optional[str] = None,
    filter_tags: Optional[List[str]] = None,
) -> list:
    """Semantic search across indexed memory.

    Args:
        query: natural-language query.
        k: number of results to return (default 5, max 20).
        collection: optional collection (defaults to project's).
        filter_path_prefix: only return results whose path contains this string.
        filter_tags: only return results having at least one of these tags.

    Returns:
        List of {id, score, path, section, lines, text, tags}, sorted by score desc.
    """
    k = max(1, min(20, k))
    return BACKEND.search(
        query, k=k,
        collection=collection,
        filter_path_prefix=filter_path_prefix,
        filter_tags=filter_tags,
    )


@mcp.tool()
def chico_memory_get(point_id: str, collection: Optional[str] = None) -> dict:
    """Retrieve a single chunk by its id (returned by chico_memory_search)."""
    result = BACKEND.get_chunk(point_id, collection=collection)
    return result or {"error": "not found"}


@mcp.tool()
def chico_memory_list_collections() -> list:
    """List all collections available in the memory backend."""
    return BACKEND.list_collections()


@mcp.tool()
def chico_memory_stats(collection: Optional[str] = None) -> dict:
    """Statistics about a collection (count, status, vector size)."""
    try:
        return BACKEND.stats(collection)
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def chico_memory_delete(path: str, collection: Optional[str] = None) -> dict:
    """Remove all chunks of a given file path from the memory."""
    p = Path(path).expanduser()
    if not p.is_absolute():
        p = (CFG.project_root / p).resolve()
    deleted = BACKEND.delete_by_path(str(p), collection=collection)
    return {"path": str(p), "deleted": deleted}


@mcp.tool()
def chico_memory_forget(collection: Optional[str] = None, confirm: str = "") -> dict:
    """Delete an ENTIRE collection. DESTRUCTIVE.

    Requires `confirm` to equal the collection name as a safety check.
    """
    target = collection or CFG.collection_name
    if confirm != target:
        return {"error": f"confirm must equal collection name '{target}' to proceed"}
    ok = BACKEND.forget_collection(target)
    return {"collection": target, "deleted": ok}


@mcp.tool()
def chico_memory_info() -> dict:
    """Diagnostic info about the running MCP and its config."""
    return {
        "version": "0.1.0",
        "project_root": str(CFG.project_root),
        "default_collection": CFG.collection_name,
        "qdrant": f"{CFG.qdrant_host}:{LOCAL_PORT} (tunnel={CFG.ssh_tunnel_enabled})",
        "embedding_model": CFG.embedding_model,
        "embedding_dimension": CFG.embedding_dimension,
        "chunk_size_tokens": CFG.chunk_size_tokens,
    }


# ---------- entry ----------

def main() -> None:
    log.info("Starting chico-rag MCP server (project=%s, collection=%s)",
             CFG.project_root.name, CFG.collection_name)
    try:
        mcp.run()
    finally:
        TUNNEL.stop()


if __name__ == "__main__":
    main()
