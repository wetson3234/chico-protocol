"""Semantic chunker — splits files into chunks adapted to their type."""
from __future__ import annotations
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List

# Approximate tokens-per-character ratio for English/French (≈ 0.25)
CHARS_PER_TOKEN = 4


@dataclass
class Chunk:
    text: str
    start_line: int
    end_line: int
    section: str = ""


def _approx_token_count(text: str) -> int:
    return max(1, len(text) // CHARS_PER_TOKEN)


def _split_by_size(text: str, target_tokens: int, overlap_tokens: int, start_line: int = 1) -> List[Chunk]:
    """Sliding window split by character size, with line-number tracking."""
    target_chars = target_tokens * CHARS_PER_TOKEN
    overlap_chars = overlap_tokens * CHARS_PER_TOKEN
    chunks: List[Chunk] = []
    if len(text) <= target_chars:
        end_line = start_line + text.count("\n")
        return [Chunk(text=text, start_line=start_line, end_line=end_line)]
    step = max(1, target_chars - overlap_chars)
    pos = 0
    while pos < len(text):
        piece = text[pos:pos + target_chars]
        # extend to next newline to avoid mid-line cuts
        nl = piece.rfind("\n")
        if nl > target_chars * 0.5:
            piece = piece[:nl]
        line_offset = text[:pos].count("\n")
        cs = start_line + line_offset
        ce = cs + piece.count("\n")
        chunks.append(Chunk(text=piece, start_line=cs, end_line=ce))
        if pos + len(piece) >= len(text):
            break
        pos += max(1, len(piece) - overlap_chars)
    return chunks


def _chunk_markdown(text: str, max_tokens: int, overlap: int) -> List[Chunk]:
    """Split markdown by H2/H3 sections, then by size if too long."""
    lines = text.split("\n")
    sections: List[tuple[str, int, List[str]]] = []  # (title, start_line, lines)
    current_title = ""
    current_start = 1
    current_lines: List[str] = []
    for i, line in enumerate(lines, start=1):
        if re.match(r"^#{1,3}\s+", line):
            if current_lines:
                sections.append((current_title, current_start, current_lines))
            current_title = line.strip("# ").strip()
            current_start = i
            current_lines = [line]
        else:
            current_lines.append(line)
    if current_lines:
        sections.append((current_title, current_start, current_lines))

    chunks: List[Chunk] = []
    for title, start_line, sec_lines in sections:
        sec_text = "\n".join(sec_lines)
        if _approx_token_count(sec_text) <= max_tokens:
            chunks.append(Chunk(text=sec_text, start_line=start_line,
                                end_line=start_line + len(sec_lines) - 1, section=title))
        else:
            for sub in _split_by_size(sec_text, max_tokens, overlap, start_line):
                sub.section = title
                chunks.append(sub)
    return chunks


def _chunk_code(text: str, max_tokens: int, overlap: int) -> List[Chunk]:
    """Split code on def/class boundaries, fallback to size split."""
    if _approx_token_count(text) <= max_tokens:
        return [Chunk(text=text, start_line=1, end_line=text.count("\n") + 1)]
    pattern = re.compile(r"^(def |class |function |async function |export (default )?(function|class|const) )", re.M)
    boundaries = [m.start() for m in pattern.finditer(text)]
    if not boundaries:
        return _split_by_size(text, max_tokens, overlap)
    boundaries.append(len(text))
    chunks: List[Chunk] = []
    for i in range(len(boundaries) - 1):
        piece = text[boundaries[i]:boundaries[i + 1]]
        line_offset = text[:boundaries[i]].count("\n") + 1
        if _approx_token_count(piece) <= max_tokens:
            chunks.append(Chunk(text=piece, start_line=line_offset,
                                end_line=line_offset + piece.count("\n")))
        else:
            chunks.extend(_split_by_size(piece, max_tokens, overlap, line_offset))
    return chunks


def chunk_file(path: Path, text: str, max_tokens: int = 500, overlap: int = 50) -> List[Chunk]:
    """Pick the right chunker based on file extension."""
    ext = path.suffix.lower()
    if ext in {".md", ".mdx", ".markdown"}:
        return _chunk_markdown(text, max_tokens, overlap)
    if ext in {".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rb", ".rs", ".cpp", ".c", ".cs"}:
        return _chunk_code(text, max_tokens, overlap)
    return _split_by_size(text, max_tokens, overlap)
