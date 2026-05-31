# Shared AI Taskflow

AI任务分解框架 - 使用共享闲置API Key完成各种任务。

## 概述

一个庞大的任务可以由AI分解为各种子任务，本项目提供：

1. **AI任务分解引擎** - 自动将大任务递归分解为原子子任务
2. **共享API Key池** - 使用他人闲置不用的模型API key
3. **文档打包拆解** - 项目文档的智能压缩与上下文注入
4. **Token消耗奖励** - 根据tokens消耗回报API key所有者现金奖励

## 架构

```
shared-ai-taskflow/
├── task_decomposer/   # AI任务分解引擎
├── api_key_pool/      # API Key池管理
├── doc_packer/        # 文档打包拆解
├── token_accountant/  # Token消耗与奖励结算
├── scheduler/         # 任务调度器
├── storage/           # 数据持久化
├── api/               # REST API接口
└── tests/             # 测试
```

## 快速开始

```bash
# 安装依赖
pip install -e ".[dev]"

# 启动服务
taskflow

# 运行测试
pytest
```

## 技术栈

- **Python 3.11+**
- **FastAPI** - 异步高性能Web框架
- **litellm** - 统一多模型AI接口
- **SQLAlchemy** - 数据库ORM
- **SQLite** (开发) / **PostgreSQL** (生产)

## 核心流程

1. 用户提交一个大任务
2. AI将任务分解为子任务DAG（有向无环图）
3. 调度器从DAG中取出可执行的子任务
4. 从API Key池中选择合适的Key执行
5. 记录每次调用的token消耗
6. 按Key owner聚合统计，计算奖励

## License

MIT
