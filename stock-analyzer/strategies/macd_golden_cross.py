"""
策略1: MACD金叉+量能确认买入策略

触发条件:
1. MACD金叉（DIF上穿DEA）
2. 金叉当日成交量 > 5日均量 × 1.5（放量确认）
3. 收盘价站上5日均线

止盈: 入场价 × 1.15（15%）或MACD死叉
止损: 入场价 × 0.93（7%）或跌破金叉当日最低价

出处: Gerald Appel MACD系统 + Granville量价理论
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class MACDGoldenCrossStrategy(BaseStrategy):
    name = "MACD金叉+量能确认"
    description = "MACD金叉配合放量确认的买入策略"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        reasons = []
        confidence = 0

        # 条件1: MACD金叉
        if not macd_signals.get("golden_cross"):
            return None
        reasons.append("MACD金叉确认")
        confidence += 35

        # 条件2: 放量确认（量比 > 1.5）
        vr = volume_signals.get("volume_ratio", 0)
        if vr < 1.5:
            return None
        reasons.append(f"放量确认(量比{vr:.1f})")
        confidence += 30

        # 条件3: 收盘价站上5日均线
        close = df["close"].values.astype(float)
        ma5 = np.mean(close[-5:])
        if close[-1] < ma5:
            return None
        reasons.append("收盘价站上5日均线")
        confidence += 20

        # 加分项
        if macd_signals.get("golden_cross_above_zero"):
            reasons.append("零轴上金叉(强势)")
            confidence += 10

        if kline_signals.get("has_bullish_signal"):
            reasons.append(f"K线看涨: {kline_signals['bullish_patterns'][0]}")
            confidence += 5

        confidence = min(confidence, 95)

        entry_price = float(close[-1])
        stop_profit = entry_price * 1.15
        stop_loss = max(entry_price * 0.93, float(df["low"].values[-1]))

        return StrategySignal(
            name=self.name,
            direction="buy",
            confidence=confidence,
            reasons=reasons,
            stop_profit=stop_profit,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
