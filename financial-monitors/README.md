# 金融市场研究模型监测系统

## 项目概述

本系统是一个综合性金融市场研究工具，包含四个核心监测看板：

1. **美国国债监测** - 收益率曲线分析与政策影响评估
2. **美元指数监测** - 美元汇率强弱周期与驱动因子分析
3. **黄金价格监测** - 黄金定价模型与多因子分析
4. **通胀监测** - CPI/PCE跟踪与通胀因子分解

## 快速开始

```bash
cd financial-monitors
npm install
npm run dev
```

访问 http://localhost:3000 查看仪表盘。

## 技术架构

- **前端框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **计量模型**: 自研 TypeScript 实现 (OLS回归、相关性分析)
- **数据层**: API Routes + 模拟数据生成器（可替换为真实数据源）

## 目录结构

```
financial-monitors/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # 后端 API 路由
│   │   │   ├── treasury/     # 美债数据接口
│   │   │   ├── usd/          # 美元数据接口
│   │   │   ├── gold/         # 黄金数据接口
│   │   │   └── inflation/    # 通胀数据接口
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 主页面
│   ├── components/
│   │   ├── charts/           # 图表组件
│   │   ├── layout/           # 布局组件
│   │   └── monitors/         # 四大监测面板
│   └── lib/
│       ├── data/             # 数据生成器
│       └── models/           # 计量经济学模型
├── docs/                      # 详细文档
└── package.json
```

## 接入真实数据

当前系统使用模拟数据进行演示。要接入真实数据源，修改 `src/lib/data/generators.ts` 中的函数，
或在 API 路由中调用以下数据源：

| 数据 | 推荐数据源 | 频率 |
|------|-----------|------|
| 国债收益率 | FRED API / Treasury.gov | 日频 |
| 美元指数 | FRED / Yahoo Finance | 日频 |
| 黄金价格 | World Gold Council / Yahoo Finance | 日频 |
| CPI/PCE | BLS API / FRED API | 月频 |
| 联邦基金利率 | FRED API | 日频 |
| M2货币供应 | FRED API | 周频 |
| VIX指数 | CBOE / Yahoo Finance | 日频 |

## 部署

```bash
npm run build
npm start
```

或部署到 Vercel:
```bash
npx vercel
```
