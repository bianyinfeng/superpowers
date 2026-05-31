"""
主分析引擎 - 整合因子计算和策略评估
"""

import pandas as pd

from factors.macd_factors import compute_macd, detect_macd_signals
from factors.volume_factors import compute_volume_factors
from factors.kline_patterns import detect_kline_patterns
from strategies import ALL_STRATEGIES
from strategies.base_strategy import StrategySignal


class StockAnalyzer:
    """股票量价分析引擎"""

    def __init__(self):
        self.daily_strategies = [
            s() for s in ALL_STRATEGIES if s.timeframe == "daily"
        ]
        self.weekly_strategies = [
            s() for s in ALL_STRATEGIES if s.timeframe == "weekly"
        ]

    def analyze(
        self,
        daily_df: pd.DataFrame,
        weekly_df: pd.DataFrame | None = None,
    ) -> dict:
        """
        对股票进行完整分析

        Parameters
        ----------
        daily_df : pd.DataFrame
            日线数据
        weekly_df : pd.DataFrame | None
            周线数据（可选）

        Returns
        -------
        dict
            分析结果，包含:
            - daily: 日线分析结果
            - weekly: 周线分析结果（如有）
            - overall_recommendation: 综合建议
        """
        result = {}

        # 日线分析
        result["daily"] = self._analyze_timeframe(
            daily_df, self.daily_strategies, "日线"
        )

        # 周线分析
        if weekly_df is not None and len(weekly_df) > 5:
            result["weekly"] = self._analyze_timeframe(
                weekly_df, self.weekly_strategies, "周线"
            )
        else:
            result["weekly"] = None

        # 综合建议
        result["overall_recommendation"] = self._generate_recommendation(
            result
        )

        return result

    def _analyze_timeframe(
        self,
        df: pd.DataFrame,
        strategies: list,
        timeframe_name: str,
    ) -> dict:
        """分析单个时间周期"""
        # 计算MACD
        df_with_macd = compute_macd(df)

        # 计算因子
        macd_signals = detect_macd_signals(df_with_macd)
        volume_signals = compute_volume_factors(df_with_macd)
        kline_signals = detect_kline_patterns(df_with_macd)

        # 评估策略
        triggered_signals = []
        for strategy in strategies:
            signal = strategy.evaluate(
                df_with_macd, macd_signals, volume_signals, kline_signals
            )
            if signal is not None:
                triggered_signals.append(signal)

        # 趋势描述
        trend_map = {
            "uptrend": "上升趋势",
            "downtrend": "下降趋势",
            "sideways": "横盘震荡",
        }

        return {
            "timeframe": timeframe_name,
            "trend": trend_map.get(kline_signals["trend"], "未知"),
            "macd_signals": macd_signals,
            "volume_signals": volume_signals,
            "kline_signals": kline_signals,
            "triggered_strategies": triggered_signals,
            "current_price": float(df["close"].values[-1]),
        }

    def _generate_recommendation(self, result: dict) -> dict:
        """生成综合交易建议"""
        daily = result.get("daily", {})
        weekly = result.get("weekly")

        daily_signals = daily.get("triggered_strategies", [])

        # 统计买卖信号
        buy_signals = [s for s in daily_signals if s.direction == "buy"]
        sell_signals = [s for s in daily_signals if s.direction == "sell"]

        # 综合方向判断
        if sell_signals:
            # 有卖出信号优先
            best_signal = max(sell_signals, key=lambda s: s.confidence)
            direction = "卖出"
            position_pct = 0
        elif buy_signals:
            best_signal = max(buy_signals, key=lambda s: s.confidence)
            direction = "买入"
            # 根据信心度和周线配合确定仓位
            base_position = 30
            if best_signal.confidence >= 80:
                base_position = 50
            if weekly and weekly.get("triggered_strategies"):
                base_position += 20  # 周线配合加仓
            position_pct = min(base_position, 60)
        else:
            best_signal = None
            direction = "观望"
            position_pct = 0

        recommendation = {
            "direction": direction,
            "position_pct": position_pct,
            "best_signal": best_signal,
            "buy_count": len(buy_signals),
            "sell_count": len(sell_signals),
        }

        # 周线趋势确认
        if weekly:
            weekly_trend = weekly.get("trend", "未知")
            recommendation["weekly_trend"] = weekly_trend
            weekly_signals = weekly.get("triggered_strategies", [])
            recommendation["weekly_signals"] = weekly_signals
        else:
            recommendation["weekly_trend"] = "无数据"
            recommendation["weekly_signals"] = []

        return recommendation
