from .base_strategy import BaseStrategy, StrategySignal
from .macd_golden_cross import MACDGoldenCrossStrategy
from .divergence_reversal import DivergenceReversalStrategy
from .volume_breakout import VolumeBreakoutStrategy
from .pullback_support import PullbackSupportStrategy
from .top_divergence import TopDivergenceStrategy
from .weekly_trend import WeeklyTrendStrategy

ALL_STRATEGIES = [
    MACDGoldenCrossStrategy,
    DivergenceReversalStrategy,
    VolumeBreakoutStrategy,
    PullbackSupportStrategy,
    TopDivergenceStrategy,
    WeeklyTrendStrategy,
]
