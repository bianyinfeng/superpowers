"""
策略基类和信号数据结构
"""

from dataclasses import dataclass, field
import pandas as pd


@dataclass
class StrategySignal:
    """策略信号"""

    name: str  # 策略名称
    direction: str  # 'buy' / 'sell' / 'hold'
    confidence: float  # 信心度 0-100
    reasons: list[str] = field(default_factory=list)  # 触发原因
    stop_profit: float | None = None  # 止盈价
    stop_loss: float | None = None  # 止损价
    entry_price: float | None = None  # 入场价（当前收盘价）


class BaseStrategy:
    """策略基类"""

    name: str = "基础策略"
    description: str = ""
    timeframe: str = "daily"  # 'daily' or 'weekly'

    def evaluate(
        self,
        df: pd.DataFrame,
        macd_signals: dict,
        volume_signals: dict,
        kline_signals: dict,
    ) -> StrategySignal | None:
        """
        评估策略是否触发

        Parameters
        ----------
        df : pd.DataFrame
            包含OHLCV和MACD数据的DataFrame
        macd_signals : dict
            MACD信号
        volume_signals : dict
            量能信号
        kline_signals : dict
            K线形态信号

        Returns
        -------
        StrategySignal | None
            如果策略触发返回信号，否则返回None
        """
        raise NotImplementedError
