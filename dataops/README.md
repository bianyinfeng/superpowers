# 数据中台运营平台 (Banking DataOps)

> 商业银行数据中台全流程运营管理系统 · v2.4.1

---

## 📌 系统概述

本系统是面向**商业银行数据中台**的全流程运营管理平台，覆盖从数据加工需求提交到正式上线的全生命周期管控，支持数据标准化治理、开发规范管理、脚本质检、灰度部署、数据质量阻断及元数据自动维护等核心场景。

---

## 🏗️ 系统架构

### 整体架构图

```
┌──────────────────────────────────────────────────────────────┐
│                    数据中台 DataOps 平台                       │
│                                                              │
│  ① 需求管理  →  ② 审核流转  →  ③ 标准匹配  →  ④ 规范开发     │
│       ↓                                                      │
│  ⑤ 脚本管理  →  ⑥ 灰度上线  →  ⑦ 数据核验  →  ⑧ 元数据管理  │
└──────────────────────────────────────────────────────────────┘
```

### 数据分层架构（银行标准）

```
业务系统层 (Source)
    │  核心银行系统 / CRM / 风控系统 / 清算系统 / 贷款系统
    ↓
ODS 贴源层 (dw_ods)
    │  dw_ods.ods_cust_info          客户基本信息
    │  dw_ods.ods_loan_contract      贷款合同信息
    │  dw_ods.ods_deposit_acct       存款账户信息
    │  dw_ods.ods_trans_detail       交易明细信息
    ↓
DWD 明细层 (dw_dwd)
    │  dw_dwd.dwd_cust_base_d        客户基础宽表（日快照）
    │  dw_dwd.dwd_loan_detail_d      贷款明细宽表
    │  dw_dwd.dwd_deposit_detail_d   存款明细宽表
    │  dw_dwd.dwd_trans_event        交易事件宽表
    ↓
DWS 汇总层 (dw_dws)
    │  dw_dws.dws_cust_asset_d       客户资产汇总（日）
    │  dw_dws.dws_loan_overdue_d     贷款逾期汇总（日）
    │  dw_dws.dws_branch_kpi_m       机构 KPI 汇总（月）
    ↓
ADS 应用层 (dw_ads)
    │  dw_ads.ads_cust_360           客户 360 画像
    │  dw_ads.ads_risk_early_warn    风险预警结果
    │  dw_ads.ads_reg_report_*       监管报送数据集
    ↓
应用/报表层 (Application)
    │  BI 报表 / 监管报送 / 风险模型 / 营销系统
```

---

## 🔄 业务流程详解

### 完整流程图

```
[业务部门]                    [数据中台]                      [运维/生产]
    │                             │                               │
    ├─① 提交数据加工需求 ─────────→│                               │
    │                             ├─② 业务审核（业务部门负责人）     │
    │                             ├─② 数据审核（数据治理岗）        │
    │                             ├─② 技术审核（数据工程师）        │
    │                             ├─② 合规审核（合规/法务）         │
    │                             │                               │
    │←── 审核结果通知 ────────────┤                               │
    │                             ├─③ 数据标准自动匹配              │
    │                             ├─④ 数据规范文档编写              │
    │                             ├─⑤ ETL脚本开发+复核             │
    │                             │                               │
    │                             ├─⑥ DEV环境部署测试 ────────────→│
    │                             ├─⑥ SIT集成测试 ─────────────────→│
    │                             ├─⑥ UAT用户验收测试 ──────────────→│
    │                             ├─⑥ GRAY灰度发布(5%→50%→100%)──→│
    │                             │                               ├─ 生产监控
    │                             ├─⑦ 数据质量规则执行              ├─ 跑批调度
    │                             ├─⑦ 异常阻断/告警                ├─ 告警处置
    │                             ├─⑧ 元数据自动扫描更新            │
    │←── 上线完成通知 ────────────┤                               │
```

---

## 📦 功能模块说明

### ① 数据需求管理 (Requirements Management)
- **功能**：业务部门在线提交数据加工需求，记录需求全生命周期
- **核心字段**：需求编号（自动生成）、业务条线、数据来源、目标表、优先级、截止日期
- **状态机**：草稿 → 待审核 → 审核中（各阶段）→ 审核通过 → 开发中 → 测试中 → 灰度上线 → 正式上线
- **特色**：需求追催、SLA 预警、关联脚本/部署自动推进

### ② 审核流转 (Workflow Approval)
- **功能**：可配置的多级审批流程，支持标准流程/快速通道/监管专项通道
- **审批角色**：业务负责人 → 数据治理岗 → 数据工程师（技术） → 合规/法务
- **特色**：超时自动升级、移动端一键审批通知、审批意见留存、驳回可重提
- **SLA 控制**：各环节设定处理时限，超时自动推送告警

### ③ 数据标准匹配 (Data Standards Matching)
- **功能**：自动将需求中的字段映射到行内数据标准库
- **匹配方式**：
  - 精确匹配：字段名完全一致（置信度 100%）
  - 模糊匹配：Levenshtein 距离 + 同义词库（置信度 70-99%）
  - 语义匹配：基于向量相似度（置信度 50-90%）
- **标准库**：来源于行内数据标准手册，对齐 CBIRC/PBOC 监管要求

### ④ 数据规范开发 (Development Specification)
- **功能**：为每个需求生成标准化开发规范文档，包含 DDL、加工逻辑、质量规则
- **模板库**：事实表/维度表/汇总表/快照表/临时加工表五种模板
- **版本管理**：规范文档版本化，变更留痕，支持 PDF 导出

### ⑤ 脚本管理 (Script Management)
- **功能**：SQL/Python/Shell 脚本的提交、解析、复核、版本管理
- **解析能力**：
  - 血缘提取：识别源表、目标表、字段级血缘
  - 合规检查：数据权限、命名规范、敏感数据访问
  - 性能分析：全表扫描告警、Join 优化建议、索引推荐
- **复核清单**：8 项标准检查项，复核人逐项签署

### ⑥ 灰度测试上线 (Canary Deployment)
- **环境链路**：DEV → SIT → UAT → GRAY → PRD
- **灰度策略**：按用户群体（VIP/部门/随机%）逐步扩量
- **自动回滚**：当错误率/质量分超过阈值时自动触发回滚
- **对比监控**：灰度环境与生产环境数据质量实时对比

### ⑦ 数据核验与跑批 (Data Verification & Batch)
- **质量规则**：7 类规则（非空/唯一/值域/格式/关联/完整/时效）
- **阻断机制**：
  - 警告：记录日志，不中断
  - 软阻断：通知相关人员，等待人工确认后继续
  - 硬阻断：立即暂停依赖此数据的所有跑批作业
- **跑批调度**：可视化依赖关系图，Cron 表达式配置，支持手动触发

### ⑧ 元数据管理 (Metadata Management)
- **自动扫描**：定时连接各数据库，扫描 DDL 变更、新增表/字段
- **血缘图谱**：从源系统到报表的全链路字段级血缘追踪
- **变更管理**：Schema 变更自动感知、影响评估、下游通知
- **数据目录**：可搜索的全行数据资产目录，含敏感分级标注

---

## 🛠️ 技术架构

### 前端技术栈
| 组件 | 版本 | 用途 |
|------|------|------|
| Vue.js | 3.4 | 响应式前端框架 |
| Vue Router | 4.3 | 客户端路由（Hash模式） |
| 纯 CSS3 | - | 设计系统 |

> **无构建工具依赖**：直接通过 CDN 加载，可在本地文件系统运行

### 后端架构参考（生产部署建议）
```
API 网关 (Kong)
    │
    ├── 需求服务 (Spring Boot)    → MySQL
    ├── 工作流服务 (Activiti)     → MySQL
    ├── 脚本解析服务 (Python)     → Redis
    ├── 调度服务 (XXL-Job)        → MySQL
    ├── 元数据服务 (Atlas)        → JanusGraph
    └── 质量服务 (Great Expectations) → ClickHouse
```

---

## 🚀 快速启动

### 方式一：直接打开（演示用）
```bash
# 直接在浏览器中打开
open dataops/index.html
```

### 方式二：本地HTTP服务
```bash
# Python
cd dataops && python3 -m http.server 8080
# 访问 http://localhost:8080

# Node.js
npx serve dataops -p 8080
```

---

## 🔐 安全合规说明

| 要求 | 实现方式 |
|------|----------|
| 数据权限 | 基于角色(RBAC)，字段级脱敏展示 |
| 操作审计 | 所有操作记录操作人、时间、IP |
| 敏感数据 | 四级分类（公开/内部/机密/绝密）|
| 监管对齐 | 符合银保监数据治理指引、央行数据标准 |
| 传输安全 | 生产环境全程 HTTPS/TLS 1.3 |

---

## 📋 监管合规参考

- 中国银保监会《银行保险机构数据治理办法》(2018)
- 中国人民银行《金融数据安全 数据安全分级指南》(JR/T 0197-2020)
- 巴塞尔委员会《有效风险数据汇总与风险报告原则》(BCBS 239)
- 国家标准《数据管理能力成熟度评估模型》(GB/T 36073-2018 DCMM)
- 《个人信息保护法》(2021) 个人金融信息保护要求

---

## 👥 用户角色权限

| 角色 | 主要功能 |
|------|----------|
| 业务人员 | 提交需求、查看进度、验收测试 |
| 数据治理岗 | 数据审核、标准维护、质量规则管理 |
| 数据工程师 | 技术审核、规范开发、脚本管理 |
| 合规专员 | 合规审核、敏感数据审查 |
| 运维工程师 | 环境管理、部署上线、跑批监控 |
| 数据管理员 | 元数据管理、扫描配置 |
| 系统管理员 | 全部权限、流程配置 |

---

*数据中台 DataOps 平台 · 商业银行版 · 2024*

---

## 🔌 第一版后端对接骨架（已落地）

项目已新增前端后端对接骨架：

- API 网关文件：[js/api.js](js/api.js)
- 启动引导调用：[js/app.js](js/app.js)
- 运行时配置入口：[index.html](index.html)

### 配置方式

可在 [index.html](index.html) 中配置：

- `useMock`: `true` 使用本地 Mock，`false` 请求后端
- `apiBaseUrl`: 后端 API 根路径
- `requestTimeoutMs`: 请求超时毫秒
- `authToken`: Bearer Token（可留空）

也可通过浏览器控制台覆盖（持久化到 localStorage）：

```javascript
localStorage.setItem('dataops.useMock', 'false');
localStorage.setItem('dataops.apiBaseUrl', 'http://127.0.0.1:8081/api');
localStorage.setItem('dataops.authToken', 'YOUR_TOKEN');
location.reload();
```

恢复本地 Mock：

```javascript
localStorage.setItem('dataops.useMock', 'true');
location.reload();
```

### 默认接口清单

- `GET /auth/me` → `currentUser`
- `GET /requirements` → `requirements`
- `GET /workflow/steps` → `workflowSteps`
- `GET /standards` → `dataStandards`
- `GET /standards/matches` → `matchResults`
- `GET /devspecs` → `devSpecs`
- `GET /scripts` → `scripts`
- `GET /deployments` → `deployments`
- `GET /quality/rules` → `qualityRules`
- `GET /batch/jobs` → `batchJobs`
- `GET /metadata/tables` → `metadataTables`
- `GET /metadata/scans` → `scanConfigs`
- `GET /activities` → `activities`
- `GET /notifications` → `notifications`

返回格式支持：

- 直接数组：`[...]`
- 包装对象：`{ items: [...] }`
- 包装对象：`{ data: [...] }`

`/auth/me` 支持：

- 直接对象：`{ id, name, ... }`
- 包装对象：`{ data: { id, name, ... } }`
