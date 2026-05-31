"""
策略6: 周线级别趋势确认策略

触发条件:
1. 周线MACD金叉
2. 周线成交量 > 4周均量
3. 周线收盘价突破前4周高点

止盈: 周线MACD死叉或周线出现长上影线
止损: 周线金叉当周最低价

出处: 多周期共振理论
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class WeeklyTrendStrategy(BaseStrategy):
    name = "周线趋势确认"
    description = "周线级别MACD金叉配合放量突破的买入策略"
    timeframe = "weekly"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        if len(df) < 5:
            return None

        close = df["close"].values.astype(float)
        high = df["high"].values.astype(float)
        low = df["low"].values.astype(float)
        volume = df["volume"].values.astype(float)

        reasons = []
        confidence = 0

        # 条件1: 周线MACD金叉
        if not macd_signals.get("golden_cross"):
            return None
        reasons.append("周线MACD金叉")
        confidence += 35

        # 条件2: 周线成交量 > 4周均量
        ma4_vol = np.mean(volume[-5:-1]) if len(volume) > 4 else volume[-1]
        if volume[-1] < ma4_vol:
            return None
        vol_ratio = volume[-1] / ma4_vol
        reasons.append(f"周线放量(量比{vol_ratio:.1f})")
        confidence += 30

        # 条件3: 收盘价突破前4周高点
        if len(high) > 4:
            prev_4w_high = float(np.max(high[-5:-1]))
            if close[-1] <= prev_4w_high:
                return None
            reasons.append(f"突破前4周高点({prev_4w_high:.2f})")
            confidence += 25
        else:
            return None

        # 加分项
        if macd_signals.get("above_zero"):
            reasons.append("MACD零轴上方(强势)")
            confidence += 5

        confidence = min(confidence, 95)

        entry_price = float(close[-1])
        # 止盈: 暂用入场价×1.20（实际应等待周线死叉）
        stop_profit = entry_price * 1.20
        # 止损: 金叉当周最低价
        stop_loss = float(low[-1])

        return StrategySignal(
            name=self.name,
            direction="buy",
            confidence=confidence,
            reasons=reasons,
            stop_profit=stop_profit,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
