# ANTLR Grammar Diff Visualizer (SQL)

一个面向 `.g4/.g` 文件的 SQL grammar 对比工具，支持：

- 从官方 GitHub 仓库按 manifest 批量同步 grammar 文件
- 归档为统一结构：`engine/version/type/{file}`
- 生成三层差异：文本、规则、结构（引用边）
- 提供 FastAPI + 网页可视化（摘要、文本 diff、变更子图）

## 目录

- `app/fetcher.py`：manifest 驱动采集器
- `app/grammar_ir.py`：`.g4/.g` 到 IR（rule + edges）
- `app/diff_engine.py`：多层 diff
- `app/api.py`：FastAPI 接口 + 静态页面
- `app/cli.py`：CLI（sync/diff/serve）
- `sources.manifest.json`：首批官方源配置

## 安装

```bash
cd /home/runner/work/superpowers/superpowers/tools/antlr-grammar-diff
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 1) 同步 grammar

```bash
python -m app.cli sync \
  --manifest /home/runner/work/superpowers/superpowers/tools/antlr-grammar-diff/sources.manifest.json \
  --mode branch_latest
```

或固定 tag：

```bash
python -m app.cli sync \
  --manifest /home/runner/work/superpowers/superpowers/tools/antlr-grammar-diff/sources.manifest.json \
  --mode tag_fixed
```

默认输出：

- 归档目录：`tools/antlr-grammar-diff/data/archive`
- 仓库缓存：`tools/antlr-grammar-diff/data/repos`

## 2) 生成差异报告（CLI）

```bash
python -m app.cli diff \
  --file-a /abs/path/to/A.g4 \
  --file-b /abs/path/to/B.g4 \
  --output-json /abs/path/to/diff.json
```

## 3) 启动网页

```bash
python -m app.cli serve --host 127.0.0.1 --port 8000
```

打开 `http://127.0.0.1:8000`。

## API

- `POST /api/sync`
- `GET /api/archive-files`
- `POST /api/diff`
- `GET /api/health`

## 说明

- `.g4` 优先，`.g` 兼容。
- 对于 manifest 中不存在的路径，采集器会在报告中标记 warning，不中断整体同步。
- 规则重命名通过相似度给出候选，不自动强判。
