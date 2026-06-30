# 数据采集与模型建模指南

## 1. 数据源清单

### 1.1 FRED (Federal Reserve Economic Data)

**网址：** https://fred.stlouisfed.org  
**API文档：** https://fred.stlouisfed.org/docs/api/fred/

| 数据系列 | FRED代码 | 用途 |
|----------|----------|------|
| 10年期国债收益率 | DGS10 | 美债模型核心变量 |
| 2年期国债收益率 | DGS2 | 期限利差计算 |
| 联邦基金有效利率 | DFF | 政策利率 |
| 通胀预期(5Y) | T5YIE | 盈亏平衡通胀率 |
| 美联储总资产 | WALCL | QE规模 |
| 美元指数(Broad) | DTWEXBGS | 美元强弱 |
| CPI同比 | CPIAUCSL | 通胀指标 |
| 核心CPI | CPILFESL | 剔除食品能源 |
| PCE价格指数 | PCEPI | 美联储首选指标 |
| M2货币供应量 | M2SL | 流动性指标 |
| 贸易差额 | BOPGSTB | 美元模型变量 |

### 1.2 BLS (Bureau of Labor Statistics)

**网址：** https://www.bls.gov/developers/  
**用途：** CPI详细分项数据（住房、食品、能源等）

### 1.3 World Gold Council

**网址：** https://www.gold.org/goldhub/data  
**用途：** 央行购金数据、黄金ETF持仓量

### 1.4 CBOE

**网址：** https://www.cboe.com/  
**用途：** VIX恐慌指数

### 1.5 Yahoo Finance API (非官方)

**用途：** 实时金价、原油价格、主要汇率

---

## 2. 数据采集代码示例

### 2.1 FRED API 调用

```typescript
// src/lib/data/fred.ts
const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

interface FredObservation {
  date: string;
  value: string;
}

export async function fetchFredSeries(
  seriesId: string,
  startDate: string = "2020-01-01"
): Promise<{ date: string; value: number }[]> {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.observations
    .filter((obs: FredObservation) => obs.value !== ".")
    .map((obs: FredObservation) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}

// 使用示例
export async function getTreasuryData() {
  const [yields10Y, yields2Y, fedRate, inflationExp, fedBalance] = await Promise.all([
    fetchFredSeries("DGS10"),
    fetchFredSeries("DGS2"),
    fetchFredSeries("DFF"),
    fetchFredSeries("T5YIE"),
    fetchFredSeries("WALCL"),
  ]);
  
  return { yields10Y, yields2Y, fedRate, inflationExp, fedBalance };
}
```

### 2.2 环境变量配置

```env
# .env.local
FRED_API_KEY=your_fred_api_key_here
```

**获取FRED API Key：** 在 https://fred.stlouisfed.org/docs/api/api_key.html 免费注册。

---

## 3. 模型建模流程

### 3.1 数据预处理

```
原始数据 → 缺失值处理 → 频率对齐 → 平稳性检验 → 建模
```

1. **缺失值处理：** 线性插值或前向填充
2. **频率对齐：** 将日频数据聚合为月频（取月末值或月均值）
3. **平稳性检验：** ADF检验。若非平稳，取一阶差分

### 3.2 OLS回归建模步骤

1. **确定因变量(Y)和自变量(X)**
2. **多重共线性检查：** 计算VIF，VIF>10需移除变量
3. **运行OLS回归**
4. **残差诊断：** 正态性、异方差、自相关
5. **稳健性检验：** 更换时间窗口、添加/移除变量

### 3.3 模型验证

- **样本内R²：** 模型在训练数据上的解释力
- **样本外预测：** 留出最近6个月数据做验证
- **滚动回归：** 检查系数是否随时间稳定

---

## 4. 扩展建议

### 4.1 升级为VAR模型

当前使用的OLS假设因果方向单一。实际中，利率影响通胀，通胀也反过来影响利率决策。

**VAR(向量自回归)模型** 能同时建模多个变量之间的动态相互影响关系，更适合宏观经济分析。

### 4.2 加入机器学习

- **随机森林：** 捕捉非线性关系
- **LSTM：** 时间序列预测
- **XGBoost：** 因子重要性排序

### 4.3 接入实时数据流

- 使用 WebSocket 接收实时行情
- 定时任务每日更新 FRED 数据
- 设置异常预警（如收益率曲线突然倒挂）

---

## 5. 注意事项

1. **FRED API有速率限制：** 每分钟120次请求
2. **数据发布时滞：** CPI通常在参考月份后2周公布
3. **数据修正：** 经济数据经常会有修正值，注意使用最终修正版
4. **市场假日：** 国债收益率在美国公共假日无数据
5. **模型局限：** 线性模型无法捕捉结构性变化和尾部风险
