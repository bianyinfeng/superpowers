"""Document packing and splitting module.

Packs project documentation into prompt-friendly format,
splits large documents into chunks that fit token limits,
and injects relevant context into subtask prompts.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class DocChunk:
    """A chunk of a document that fits within token limits."""

    content: str
    source_file: str
    chunk_index: int
    total_chunks: int
    token_estimate: int


@dataclass
class PackedContext:
    """Packed project context for injection into subtask prompts."""

    summary: str
    chunks: list[DocChunk] = field(default_factory=list)
    total_tokens: int = 0


class DocPacker:
    """Handles document packing, splitting, and context injection."""

    # Approximate chars per token ratio (conservative)
    CHARS_PER_TOKEN = 3.5

    def __init__(self, max_tokens_per_chunk: int = 4000, max_context_tokens: int = 8000):
        """Initialize packer with token limits.

        Args:
            max_tokens_per_chunk: Maximum tokens per document chunk.
            max_context_tokens: Maximum total tokens for packed context.
        """
        self.max_tokens_per_chunk = max_tokens_per_chunk
        self.max_context_tokens = max_context_tokens

    def estimate_tokens(self, text: str) -> int:
        """Estimate token count for a text string."""
        return int(len(text) / self.CHARS_PER_TOKEN)

    def split_document(self, content: str, source_file: str = "") -> list[DocChunk]:
        """Split a document into chunks that fit within token limits.

        Splits on paragraph boundaries when possible.
        """
        max_chars = int(self.max_tokens_per_chunk * self.CHARS_PER_TOKEN)

        if len(content) <= max_chars:
            return [
                DocChunk(
                    content=content,
                    source_file=source_file,
                    chunk_index=0,
                    total_chunks=1,
                    token_estimate=self.estimate_tokens(content),
                )
            ]

        # Split on double newlines (paragraphs)
        paragraphs = content.split("\n\n")
        chunks: list[DocChunk] = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 > max_chars:
                if current_chunk:
                    chunks.append(current_chunk)
                # If single paragraph exceeds limit, force-split
                if len(para) > max_chars:
                    for i in range(0, len(para), max_chars):
                        chunks.append(para[i : i + max_chars])
                else:
                    current_chunk = para
            else:
                current_chunk = f"{current_chunk}\n\n{para}" if current_chunk else para

        if current_chunk:
            chunks.append(current_chunk)

        total = len(chunks)
        return [
            DocChunk(
                content=chunk,
                source_file=source_file,
                chunk_index=i,
                total_chunks=total,
                token_estimate=self.estimate_tokens(chunk),
            )
            for i, chunk in enumerate(chunks)
        ]

    def pack_directory(
        self,
        directory: str | Path,
        extensions: tuple[str, ...] = (".md", ".txt", ".rst"),
    ) -> PackedContext:
        """Pack all documentation files in a directory into a context.

        Args:
            directory: Path to the documentation directory.
            extensions: File extensions to include.

        Returns:
            PackedContext with summary and document chunks.
        """
        directory = Path(directory)
        all_chunks: list[DocChunk] = []
        total_tokens = 0

        for ext in extensions:
            for filepath in sorted(directory.rglob(f"*{ext}")):
                if total_tokens >= self.max_context_tokens:
                    break
                content = filepath.read_text(encoding="utf-8", errors="ignore")
                chunks = self.split_document(content, str(filepath.relative_to(directory)))
                for chunk in chunks:
                    if total_tokens + chunk.token_estimate > self.max_context_tokens:
                        break
                    all_chunks.append(chunk)
                    total_tokens += chunk.token_estimate

        summary = self._generate_summary(all_chunks)
        return PackedContext(summary=summary, chunks=all_chunks, total_tokens=total_tokens)

    def _generate_summary(self, chunks: list[DocChunk]) -> str:
        """Generate a brief summary listing of packed documents."""
        files = set(c.source_file for c in chunks)
        lines = [f"Packed {len(chunks)} chunks from {len(files)} files:"]
        for f in sorted(files):
            lines.append(f"  - {f}")
        return "\n".join(lines)

    def inject_context(self, subtask_prompt: str, context: PackedContext) -> str:
        """Inject packed context into a subtask prompt.

        Prepends relevant context to the subtask description.
        """
        context_text = "\n\n".join(
            f"[{c.source_file} ({c.chunk_index + 1}/{c.total_chunks})]\n{c.content}"
            for c in context.chunks
        )
        return (
            f"## Project Context\n\n{context.summary}\n\n"
            f"{context_text}\n\n"
            f"## Task\n\n{subtask_prompt}"
        )
