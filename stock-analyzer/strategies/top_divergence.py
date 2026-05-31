"""
策略5: 顶背离+天量见顶卖出策略

触发条件:
1. MACD顶背离（价格新高，MACD未新高）
2. 近5日出现天量（> 60日均量 × 3）
3. 出现看跌K线形态（黄昏之星/乌云盖顶/看跌吞没）

操作: 卖出
止损: 顶背离形成时的最高价 × 1.03

出处: 背离理论 + 天量天价经验法则
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class TopDivergenceStrategy(BaseStrategy):
    name = "顶背离+天量见顶"
    description = "MACD顶背离配合天量和看跌K线的卖出策略"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        reasons = []
        confidence = 0

        # 条件1: MACD顶背离
        if not macd_signals.get("top_divergence"):
            return None
        reasons.append("MACD顶背离确认")
        confidence += 35

        # 条件2: 近5日出现天量
        if not volume_signals.get("recent_extreme_high"):
            return None
        reasons.append("近期出现天量信号")
        confidence += 30

        # 条件3: 看跌K线形态
        if not kline_signals.get("has_bearish_signal"):
            return None
        patterns = kline_signals["bearish_patterns"]
        reasons.append(f"看跌K线: {patterns[0]}")
        confidence += 25

        # 加分项
        if macd_signals.get("bar_shrinking") == "red_shrink":
            reasons.append("红柱缩短，动量衰减")
            confidence += 5

        confidence = min(confidence, 95)

        close = df["close"].values.astype(float)
        high = df["high"].values.astype(float)

        entry_price = float(close[-1])
        recent_high = float(np.max(high[-20:]))

        # 卖出策略无止盈（目标是空仓），止损为最高价×1.03
        stop_loss = recent_high * 1.03

        return StrategySignal(
            name=self.name,
            direction="sell",
            confidence=confidence,
            reasons=reasons,
            stop_profit=None,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
