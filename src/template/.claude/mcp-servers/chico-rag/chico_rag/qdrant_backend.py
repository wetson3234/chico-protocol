"""Qdrant backend — collection management + indexing + search."""
from __future__ import annotations
import logging
import uuid
from pathlib import Path
from typing import Any, List, Dict, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from .config import Config
from .embeddings import Embedder
from .chunker import chunk_file, Chunk

log = logging.getLogger(__name__)


class QdrantBackend:
    def __init__(self, cfg: Config, local_port: int, embedder: Embedder):
        self.cfg = cfg
        self.embedder = embedder
        self.client = QdrantClient(
            host=cfg.qdrant_host,
            port=local_port,
            api_key=cfg.qdrant_api_key,
            https=False,
            timeout=30,
        )

    # --------- collection lifecycle ---------

    def ensure_collection(self, name: Optional[str] = None) -> str:
        """Create the collection if missing. Returns collection name."""
        coll = name or self.cfg.collection_name
        existing = {c.name for c in self.client.get_collections().collections}
        if coll not in existing:
            log.info("Creating collection %s (dim=%d)", coll, self.embedder.dimension)
            self.client.create_collection(
                collection_name=coll,
                vectors_config=qmodels.VectorParams(
                    size=self.embedder.dimension,
                    distance=qmodels.Distance.COSINE,
                ),
            )
        return coll

    def list_collections(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for c in self.client.get_collections().collections:
            info = self.client.get_collection(c.name)
            out.append({
                "name": c.name,
                "points_count": info.points_count,
                "vectors_count": info.vectors_count,
                "status": str(info.status),
            })
        return out

    def stats(self, name: Optional[str] = None) -> Dict[str, Any]:
        coll = name or self.cfg.collection_name
        info = self.client.get_collection(coll)
        return {
            "collection": coll,
            "points_count": info.points_count,
            "vectors_count": info.vectors_count,
            "indexed_vectors_count": info.indexed_vectors_count,
            "status": str(info.status),
            "vector_size": info.config.params.vectors.size,
            "distance": str(info.config.params.vectors.distance),
        }

    # --------- indexing ---------

    def index_file(self, path: Path, tags: Optional[List[str]] = None,
                   collection: Optional[str] = None) -> Dict[str, Any]:
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(str(path))
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return {"path": str(path), "skipped": True, "reason": "binary or non-utf8"}

        if not text.strip():
            return {"path": str(path), "skipped": True, "reason": "empty"}

        coll = self.ensure_collection(collection)
        chunks: List[Chunk] = chunk_file(
            path, text,
            max_tokens=self.cfg.chunk_size_tokens,
            overlap=self.cfg.chunk_overlap_tokens,
        )
        if not chunks:
            return {"path": str(path), "skipped": True, "reason": "no chunks"}

        # Replace any existing points for this path
        self.delete_by_path(str(path), collection=coll)

        texts = [c.text for c in chunks]
        vectors = self.embedder.encode(texts, is_query=False)
        points = []
        for ch, vec in zip(chunks, vectors):
            pid = str(uuid.uuid4())
            payload = {
                "path": str(path),
                "filename": path.name,
                "ext": path.suffix.lower(),
                "section": ch.section,
                "start_line": ch.start_line,
                "end_line": ch.end_line,
                "text": ch.text,
                "tags": tags or [],
            }
            points.append(qmodels.PointStruct(id=pid, vector=vec, payload=payload))
        self.client.upsert(collection_name=coll, points=points, wait=True)
        return {
            "path": str(path),
            "chunks": len(points),
            "collection": coll,
        }

    def index_directory(self, root: Path, patterns: Optional[List[str]] = None,
                        tags: Optional[List[str]] = None,
                        collection: Optional[str] = None,
                        max_files: int = 1000) -> Dict[str, Any]:
        patterns = patterns or ["*.md", "*.py", "*.ts", "*.tsx", "*.js", "*.jsx",
                                "*.json", "*.yaml", "*.yml", "*.txt"]
        ignore_dirs = {"node_modules", ".git", ".next", ".venv", "__pycache__",
                       "dist", "build", ".cache"}
        files: List[Path] = []
        for pattern in patterns:
            for f in root.rglob(pattern):
                if any(part in ignore_dirs for part in f.parts):
                    continue
                if f.is_file():
                    files.append(f)
                if len(files) >= max_files:
                    break
            if len(files) >= max_files:
                break

        results = {"total": 0, "indexed": 0, "chunks": 0, "skipped": 0, "errors": []}
        for f in files:
            results["total"] += 1
            try:
                r = self.index_file(f, tags=tags, collection=collection)
                if r.get("skipped"):
                    results["skipped"] += 1
                else:
                    results["indexed"] += 1
                    results["chunks"] += r["chunks"]
            except Exception as e:
                results["errors"].append({"path": str(f), "error": str(e)})
        return results

    # --------- search ---------

    def search(self, query: str, k: int = 5,
               collection: Optional[str] = None,
               filter_path_prefix: Optional[str] = None,
               filter_tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        coll = collection or self.cfg.collection_name
        qvec = self.embedder.encode([query], is_query=True)[0]
        flt = None
        must: List[qmodels.FieldCondition] = []
        if filter_path_prefix:
            must.append(qmodels.FieldCondition(
                key="path",
                match=qmodels.MatchText(text=filter_path_prefix),
            ))
        if filter_tags:
            must.append(qmodels.FieldCondition(
                key="tags",
                match=qmodels.MatchAny(any=filter_tags),
            ))
        if must:
            flt = qmodels.Filter(must=must)
        response = self.client.query_points(
            collection_name=coll,
            query=qvec,
            limit=k,
            query_filter=flt,
            with_payload=True,
        )
        return [
            {
                "id": str(r.id),
                "score": float(r.score),
                "path": r.payload.get("path"),
                "section": r.payload.get("section"),
                "lines": f"{r.payload.get('start_line')}-{r.payload.get('end_line')}",
                "text": r.payload.get("text"),
                "tags": r.payload.get("tags", []),
            }
            for r in response.points
        ]

    # --------- delete ---------

    def delete_by_path(self, path: str, collection: Optional[str] = None) -> int:
        coll = collection or self.cfg.collection_name
        try:
            self.client.delete(
                collection_name=coll,
                points_selector=qmodels.FilterSelector(filter=qmodels.Filter(
                    must=[qmodels.FieldCondition(key="path", match=qmodels.MatchValue(value=path))]
                )),
                wait=True,
            )
            return 1
        except Exception:
            return 0

    def forget_collection(self, name: Optional[str] = None) -> bool:
        coll = name or self.cfg.collection_name
        try:
            self.client.delete_collection(collection_name=coll)
            return True
        except Exception as e:
            log.warning("Failed to delete collection %s: %s", coll, e)
            return False

    def get_chunk(self, point_id: str, collection: Optional[str] = None) -> Optional[Dict[str, Any]]:
        coll = collection or self.cfg.collection_name
        result = self.client.retrieve(collection_name=coll, ids=[point_id], with_payload=True)
        if not result:
            return None
        p = result[0]
        return {"id": str(p.id), **(p.payload or {})}
