"""
策略2: 底背离+地量反转策略

触发条件:
1. MACD底背离确认（价格创新低，MACD不创新低）
2. 近5日内出现地量（< 60日均量 × 0.4）
3. 出现看涨K线形态（锤子线/早晨之星/看涨吞没）

止盈: 前一波下跌的0.618回撤位
止损: 底背离形成时的最低价 × 0.97

出处: 背离理论 + 量价极端配合经验
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class DivergenceReversalStrategy(BaseStrategy):
    name = "底背离+地量反转"
    description = "MACD底背离配合地量和看涨K线形态的反转买入策略"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        reasons = []
        confidence = 0

        # 条件1: MACD底背离
        if not macd_signals.get("bottom_divergence"):
            return None
        reasons.append("MACD底背离确认")
        confidence += 35

        # 条件2: 近5日出现地量
        if not volume_signals.get("recent_extreme_low"):
            return None
        reasons.append("近期出现地量信号")
        confidence += 30

        # 条件3: 看涨K线形态
        if not kline_signals.get("has_bullish_signal"):
            return None
        patterns = kline_signals["bullish_patterns"]
        reasons.append(f"看涨K线: {patterns[0]}")
        confidence += 25

        # 加分项
        if volume_signals.get("obv_trend") == "rising":
            reasons.append("OBV趋势向上")
            confidence += 5

        confidence = min(confidence, 95)

        # 止盈止损计算
        close = df["close"].values.astype(float)
        high = df["high"].values.astype(float)
        low = df["low"].values.astype(float)

        entry_price = float(close[-1])

        # 前一波高点（近60日最高）
        recent_high = float(np.max(high[-60:]))
        recent_low = float(np.min(low[-60:]))

        # 0.618回撤位作为止盈
        stop_profit = recent_low + (recent_high - recent_low) * 0.618
        # 最低价 × 0.97 作为止损
        stop_loss = recent_low * 0.97

        return StrategySignal(
            name=self.name,
            direction="buy",
            confidence=confidence,
            reasons=reasons,
            stop_profit=stop_profit,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
