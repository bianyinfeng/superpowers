"""Tests for the DocPacker module."""

from doc_packer.packer import DocChunk, DocPacker, PackedContext


def test_estimate_tokens():
    packer = DocPacker()
    # 35 chars / 3.5 = 10 tokens
    assert packer.estimate_tokens("a" * 35) == 10


def test_split_short_document():
    packer = DocPacker(max_tokens_per_chunk=1000)
    chunks = packer.split_document("Hello world", "test.md")
    assert len(chunks) == 1
    assert chunks[0].content == "Hello world"
    assert chunks[0].source_file == "test.md"
    assert chunks[0].chunk_index == 0
    assert chunks[0].total_chunks == 1


def test_split_long_document():
    packer = DocPacker(max_tokens_per_chunk=10)  # Very small limit
    # Create content that exceeds 10 tokens (~35 chars)
    content = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph that is longer."
    chunks = packer.split_document(content, "big.md")
    assert len(chunks) > 1
    for chunk in chunks:
        assert chunk.source_file == "big.md"
        assert chunk.total_chunks == len(chunks)


def test_inject_context():
    packer = DocPacker()
    context = PackedContext(
        summary="Test summary",
        chunks=[
            DocChunk(
                content="Some context",
                source_file="readme.md",
                chunk_index=0,
                total_chunks=1,
                token_estimate=5,
            )
        ],
        total_tokens=5,
    )
    result = packer.inject_context("Do something", context)
    assert "## Project Context" in result
    assert "Test summary" in result
    assert "Some context" in result
    assert "## Task" in result
    assert "Do something" in result


def test_pack_directory(tmp_path):
    # Create test files
    (tmp_path / "doc1.md").write_text("# Hello\n\nThis is doc 1.")
    (tmp_path / "doc2.txt").write_text("Some text content here.")
    (tmp_path / "ignored.py").write_text("# Not a doc file")

    packer = DocPacker()
    packed = packer.pack_directory(tmp_path)

    assert packed.total_tokens > 0
    assert len(packed.chunks) >= 2
    source_files = {c.source_file for c in packed.chunks}
    assert "doc1.md" in source_files
    assert "doc2.txt" in source_files
    assert "ignored.py" not in source_files
