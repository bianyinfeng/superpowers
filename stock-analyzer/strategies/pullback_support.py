"""
策略4: 缩量回踩均线策略

触发条件:
1. 股价处于上升趋势（5日/10日/20日均线多头排列）
2. 回踩10日或20日均线
3. 回踩过程中成交量持续萎缩（连续3日缩量）
4. 出现止跌K线（下影线>实体 或 十字星）

止盈: 前高位置或入场价 × 1.10
止损: 跌破20日均线 × 0.97

出处: Granville八大法则(均线支撑) + 缩量止跌经验
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class PullbackSupportStrategy(BaseStrategy):
    name = "缩量回踩均线"
    description = "上升趋势中缩量回踩均线获支撑的买入策略"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        if len(df) < 21:
            return None

        close = df["close"].values.astype(float)
        low = df["low"].values.astype(float)
        high = df["high"].values.astype(float)
        o = df["open"].values.astype(float)

        reasons = []
        confidence = 0

        # 条件1: 均线多头排列（5>10>20）
        ma5 = np.mean(close[-5:])
        ma10 = np.mean(close[-10:])
        ma20 = np.mean(close[-20:])

        if not (ma5 > ma10 > ma20):
            return None
        reasons.append("均线多头排列(5>10>20)")
        confidence += 25

        # 条件2: 回踩10日或20日均线
        # 当前价格接近MA10或MA20（在其上方1%以内或刚触及）
        touch_ma10 = low[-1] <= ma10 * 1.01 and close[-1] >= ma10
        touch_ma20 = low[-1] <= ma20 * 1.01 and close[-1] >= ma20

        if not (touch_ma10 or touch_ma20):
            return None

        if touch_ma10:
            reasons.append("回踩10日均线获支撑")
        else:
            reasons.append("回踩20日均线获支撑")
        confidence += 25

        # 条件3: 连续缩量（>=3天）
        consec_shrink = volume_signals.get("consecutive_shrink", 0)
        if consec_shrink < 3:
            return None
        reasons.append(f"连续{consec_shrink}日缩量")
        confidence += 25

        # 条件4: 止跌K线（下影线>实体 或 十字星）
        body = abs(close[-1] - o[-1])
        lower_shadow = min(o[-1], close[-1]) - low[-1]
        total_range = high[-1] - low[-1]

        is_stop_decline = False
        if total_range > 0:
            if lower_shadow > body:
                is_stop_decline = True
                reasons.append("出现止跌长下影线")
            elif body <= total_range * 0.1:
                is_stop_decline = True
                reasons.append("出现十字星止跌")

        if not is_stop_decline:
            # 放宽条件: 如果今日收阳也算
            if close[-1] > o[-1]:
                is_stop_decline = True
                reasons.append("阳线确认止跌")
            else:
                return None

        confidence += 15

        # 加分项
        if macd_signals.get("above_zero"):
            reasons.append("MACD零轴上方")
            confidence += 5

        confidence = min(confidence, 95)

        entry_price = float(close[-1])
        # 前高作为止盈
        recent_high = float(np.max(high[-20:]))
        stop_profit = max(recent_high, entry_price * 1.10)
        # 跌破20日均线3%止损
        stop_loss = ma20 * 0.97

        return StrategySignal(
            name=self.name,
            direction="buy",
            confidence=confidence,
            reasons=reasons,
            stop_profit=stop_profit,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
