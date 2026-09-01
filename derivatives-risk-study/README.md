# 期权期货风险测度研究 | Derivatives Risk Study

一个全面的Python工具库，用于研究和可视化期权、期货的风险测度及组合策略。

## 🎯 项目目标

- **直观理解** Greeks（Delta, Gamma, Theta, Vega等）在不同市场条件下的变化
- **分析组合策略** 的损益特征、盈亏平衡点与风险敞口
- **3D曲面与动画** 观察时间、波动率、标的价格对期权价值的影响
- **量化因子** 辅助交易择时决策
- **仓位管理** 学习科学的风险控制方法

## 📦 安装

```bash
cd derivatives-risk-study
pip install -e ".[notebook]"    # 含Jupyter支持
# 或
pip install -e .                # 最小安装
```

## 🚀 快速开始

```bash
# 使用合成数据运行完整演示（无需网络）
python examples/full_demo.py

# 使用真实Yahoo Finance数据
python examples/full_demo.py --live
```

## 📊 项目结构

```
derivatives-risk-study/
├── deriv_risk/
│   ├── data/
│   │   └── market_data.py        # 数据获取：yfinance + 合成数据
│   ├── pricing/
│   │   ├── black_scholes.py      # BS定价、全套Greeks、隐含波动率
│   │   ├── futures.py            # 期货定价、Black-76、保证金计算
│   │   └── monte_carlo.py        # MC模拟、VaR/CVaR
│   ├── strategies/
│   │   └── combinations.py       # 8种经典组合策略
│   ├── visualization/
│   │   └── charts.py             # Plotly交互图表与动画
│   ├── factors/
│   │   └── quant_factors.py      # 量化因子库
│   └── risk_mgmt/
│       └── position_sizing.py    # 仓位管理与风控规则
├── examples/
│   └── full_demo.py              # 完整演示脚本
└── docs/
    └── (策略文档)
```

## 📈 包含的策略

| 策略 | 英文名 | 适用场景 | 最大风险 |
|------|--------|----------|----------|
| 备兑开仓 | Covered Call | 温和看涨 + 增强收益 | 标的下跌（无限） |
| 保护性看跌 | Protective Put | 持有多头 + 防暴跌 | 权利金 |
| 牛市价差 | Bull Call Spread | 温和看涨 + 限制成本 | 净权利金 |
| 熊市价差 | Bear Put Spread | 温和看跌 + 限制成本 | 净权利金 |
| 跨式组合 | Long Straddle | 预期大幅波动 | 总权利金 |
| 宽跨式 | Long Strangle | 预期大幅波动（更便宜） | 总权利金 |
| 铁鹰策略 | Iron Condor | 预期横盘整理 | 翼宽 - 净收入 |
| 蝶式策略 | Butterfly | 精确预测价格 | 净权利金 |
| 日历价差 | Calendar Spread | 利用时间价值差异 | 净权利金 |

## 🔍 量化因子

### 波动率因子
- **波动率体制** (Volatility Regime)：短期/长期HV比值判断市场状态
- **IV Percentile**：隐含波动率在历史中的百分位
- **IV-HV Spread**：判断期权定价是否"便宜"或"贵"
- **波动率微笑/偏度**：OTM Put vs ATM vs OTM Call IV

### 动量/均值回归因子
- **RSI**：超买/超卖信号
- **Bollinger Bands %B**：价格在布林带中的位置
- **MACD**：趋势与动量

### 期权特有因子
- **Put/Call Ratio**：市场情绪
- **期限结构**：近远月IV差异（Contango vs Backwardation）
- **Gamma暴露信号**：组合Gamma风险预警
- **Theta衰减预警**：临近到期的时间价值加速损耗

## ⚠️ 风险控制指南

### 仓位管理
1. **Kelly准则** → 理论最优但波动大，实践中用**半Kelly**
2. **固定比例法** → 每笔交易风险不超过账户的1-2%
3. **Greeks限额** → 设定Delta/Gamma/Vega/Theta上限

### 择时建议

| 场景 | 最佳DTE | IV条件 | 出场规则 |
|------|---------|--------|----------|
| 卖权利金 | 30-45天 | IV Rank > 50% | 50%利润或21DTE |
| 买权利金 | 60-90天 | IV Rank < 30% | 50-100%利润 |
| 财报策略 | 7-14天 | IV膨胀期 | 财报后立即评估 |
| 对冲保护 | 匹配持仓期 | 任何 | 随持仓了结 |

### 关键避坑提醒 🚨

1. **Gamma Risk (Gamma风险)**：临近到期时Gamma飙升，卖方可能在一天内被"穿仓"
2. **Theta Trap (Theta陷阱)**：不要仅因为Theta正值就卖出期权，需同时考虑Gamma暴露
3. **Vol Crush (波动率坍塌)**：财报/事件后IV急剧下降，多头期权即使方向正确也可能亏损
4. **Assignment Risk (行权风险)**：美式期权卖方可能被提前行权（特别是除权日前）
5. **Liquidity Trap (流动性陷阱)**：Bid-Ask价差过大的合约会吃掉大部分利润
6. **杠杆失控**：期货杠杆10-20倍，一个3%的反向运动就是30-60%的保证金损失

## 📊 可视化功能

运行demo后生成的交互式图表（HTML格式，浏览器打开）：

- `output_covered_call.html` — 备兑开仓损益图
- `output_iron_condor.html` — 铁鹰策略损益图
- `output_3d_delta.html` — Delta 3D曲面
- `output_3d_gamma.html` — Gamma 3D曲面
- `output_greeks_animation.html` — **Greeks随时间变化动画（含滑块控制）**
- `output_pnl_heatmap.html` — 损益热力图
- `output_mc_paths.html` — 蒙特卡洛路径扇形图
- `output_vol_smile.html` — 波动率微笑

## 📚 参考资料

- *Options, Futures, and Other Derivatives* - John C. Hull
- *Option Volatility and Pricing* - Sheldon Natenberg
- *The Volatility Surface* - Jim Gatheral
- CBOE Education: https://www.cboe.com/education/
