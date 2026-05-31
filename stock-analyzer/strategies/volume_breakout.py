"""
策略3: 放量突破策略

触发条件:
1. 收盘价突破近20日最高价
2. 突破当日成交量 > 20日均量 × 2
3. MACD位于零轴上方或正在上穿零轴

止盈: 突破幅度 × 1.5 作为目标（量度涨幅）
止损: 突破平台上沿（即前高位置）

出处: William O'Neil CAN-SLIM突破逻辑 + 量价确认
"""

import numpy as np
import pandas as pd

from .base_strategy import BaseStrategy, StrategySignal


class VolumeBreakoutStrategy(BaseStrategy):
    name = "放量突破"
    description = "价格放量突破前期高点的买入策略"

    def evaluate(self, df, macd_signals, volume_signals, kline_signals):
        if len(df) < 21:
            return None

        close = df["close"].values.astype(float)
        high = df["high"].values.astype(float)
        volume = df["volume"].values.astype(float)

        reasons = []
        confidence = 0

        # 条件1: 收盘价突破近20日最高价
        prev_20_high = float(np.max(high[-21:-1]))
        if close[-1] <= prev_20_high:
            return None
        reasons.append(f"突破20日高点({prev_20_high:.2f})")
        confidence += 35

        # 条件2: 成交量 > 20日均量 × 2
        ma20_vol = float(np.mean(volume[-21:-1]))
        if volume[-1] < ma20_vol * 2:
            return None
        vol_ratio = volume[-1] / ma20_vol
        reasons.append(f"放量突破(量比{vol_ratio:.1f})")
        confidence += 30

        # 条件3: MACD零轴上方或上穿零轴
        if not macd_signals.get("above_zero"):
            # 检查是否正在上穿
            dif = macd_signals.get("dif", 0)
            if dif < -0.5:  # 给一点容差
                return None
            reasons.append("MACD接近零轴")
            confidence += 15
        else:
            reasons.append("MACD零轴上方")
            confidence += 20

        # 加分项
        if kline_signals.get("trend") == "uptrend":
            reasons.append("上升趋势中突破")
            confidence += 10

        confidence = min(confidence, 95)

        entry_price = float(close[-1])
        # 量度涨幅: 突破幅度 × 1.5
        breakout_range = entry_price - prev_20_high
        stop_profit = entry_price + breakout_range * 1.5
        # 止损: 前高位置
        stop_loss = prev_20_high

        return StrategySignal(
            name=self.name,
            direction="buy",
            confidence=confidence,
            reasons=reasons,
            stop_profit=stop_profit,
            stop_loss=stop_loss,
            entry_price=entry_price,
        )
