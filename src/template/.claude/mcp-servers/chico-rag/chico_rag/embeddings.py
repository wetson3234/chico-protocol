"""Embedding model wrapper — uses sentence-transformers locally."""
from __future__ import annotations
import logging
from typing import List
from sentence_transformers import SentenceTransformer
from .config import Config

log = logging.getLogger(__name__)


class Embedder:
    """Thin wrapper around SentenceTransformer; lazy-loads the model on first use."""

    def __init__(self, cfg: Config):
        self.cfg = cfg
        self._model: SentenceTransformer | None = None

    def _ensure_loaded(self) -> SentenceTransformer:
        if self._model is None:
            log.info("Loading embedding model %s on %s (this can take ~10-30s on first run)",
                     self.cfg.embedding_model, self.cfg.embedding_device)
            self._model = SentenceTransformer(
                self.cfg.embedding_model,
                device=self.cfg.embedding_device,
            )
            actual_dim = self._model.get_sentence_embedding_dimension()
            if actual_dim != self.cfg.embedding_dimension:
                log.warning("Embedding dimension mismatch: configured=%d actual=%d",
                            self.cfg.embedding_dimension, actual_dim)
        return self._model

    def encode(self, texts: List[str], is_query: bool = False) -> List[List[float]]:
        """Encode a list of texts to dense vectors."""
        if not texts:
            return []
        model = self._ensure_loaded()
        # bge models recommend a query prefix when embedding a query
        if is_query and "bge" in self.cfg.embedding_model.lower():
            texts = [f"Represent this sentence for searching relevant passages: {t}" for t in texts]
        vectors = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            batch_size=16,
        )
        return [v.tolist() for v in vectors]

    @property
    def dimension(self) -> int:
        return self.cfg.embedding_dimension
