"""
Position sizing, risk management, and trading rules.

Practical tools for:
- Kelly criterion sizing
- Fixed-fractional sizing
- Stop-loss / take-profit levels
- Portfolio VaR budgeting
- Greeks-based risk limits
"""

from __future__ import annotations

import numpy as np


# ─── Position sizing ───────────────────────────────────────────────────

def kelly_fraction(win_rate: float, avg_win: float, avg_loss: float) -> float:
    """Kelly criterion: optimal fraction of capital to risk.

    f* = (p * b - q) / b, where p=win_rate, q=1-p, b=avg_win/avg_loss.
    """
    if avg_loss == 0:
        return 0.0
    b = avg_win / avg_loss
    q = 1 - win_rate
    f = (win_rate * b - q) / b
    return max(f, 0.0)


def half_kelly(win_rate: float, avg_win: float, avg_loss: float) -> float:
    """Half-Kelly: more conservative sizing (recommended for practice)."""
    return kelly_fraction(win_rate, avg_win, avg_loss) / 2


def fixed_fractional_size(
    capital: float,
    risk_per_trade_pct: float,
    max_loss_per_unit: float,
) -> int:
    """Number of contracts/shares to trade with fixed-fractional risk.

    Args:
        capital: Total account capital.
        risk_per_trade_pct: Max % of capital to risk per trade (e.g. 2.0).
        max_loss_per_unit: Maximum loss per contract/share.

    Returns:
        Number of units to trade.
    """
    if max_loss_per_unit <= 0:
        return 0
    risk_amount = capital * risk_per_trade_pct / 100
    return int(risk_amount / max_loss_per_unit)


# ─── Stop-loss / take-profit ───────────────────────────────────────────

def atr_stop(
    prices_high: np.ndarray,
    prices_low: np.ndarray,
    prices_close: np.ndarray,
    period: int = 14,
    multiplier: float = 2.0,
) -> dict:
    """ATR-based stop-loss level.

    Returns:
        Dict with 'atr', 'long_stop', 'short_stop'.
    """
    high = np.asarray(prices_high)
    low = np.asarray(prices_low)
    close = np.asarray(prices_close)

    tr = np.maximum(
        high[1:] - low[1:],
        np.maximum(
            np.abs(high[1:] - close[:-1]),
            np.abs(low[1:] - close[:-1]),
        ),
    )
    atr = np.mean(tr[-period:])
    current = close[-1]
    return {
        "atr": atr,
        "long_stop": current - multiplier * atr,
        "short_stop": current + multiplier * atr,
    }


def risk_reward_ratio(
    entry: float, stop_loss: float, take_profit: float
) -> float:
    """Risk-Reward ratio. Should aim for >= 2.0."""
    risk = abs(entry - stop_loss)
    if risk == 0:
        return float("inf")
    reward = abs(take_profit - entry)
    return reward / risk


# ─── Portfolio-level risk limits ────────────────────────────────────────

class RiskLimits:
    """Portfolio risk limit checker.

    Usage:
        limits = RiskLimits(max_delta=500, max_gamma=100, max_vega=200, max_theta=-50)
        limits.check({"delta": 300, "gamma": 120, "theta": -30, "vega": 150})
    """

    def __init__(
        self,
        max_delta: float = 500,
        max_gamma: float = 100,
        max_vega: float = 200,
        max_theta: float = -100,
        max_portfolio_var_pct: float = 5.0,
    ):
        self.max_delta = max_delta
        self.max_gamma = max_gamma
        self.max_vega = max_vega
        self.max_theta = max_theta
        self.max_portfolio_var_pct = max_portfolio_var_pct

    def check(self, greeks: dict) -> list[str]:
        """Check portfolio Greeks against limits. Returns list of violations."""
        violations = []
        if abs(greeks.get("delta", 0)) > self.max_delta:
            violations.append(
                f"⚠️ Delta超限: {greeks['delta']:.1f} (限值 ±{self.max_delta})"
            )
        if abs(greeks.get("gamma", 0)) > self.max_gamma:
            violations.append(
                f"⚠️ Gamma超限: {greeks['gamma']:.1f} (限值 {self.max_gamma})"
            )
        if abs(greeks.get("vega", 0)) > self.max_vega:
            violations.append(
                f"⚠️ Vega超限: {greeks['vega']:.1f} (限值 {self.max_vega})"
            )
        if greeks.get("theta", 0) < self.max_theta:
            violations.append(
                f"⚠️ Theta过大: {greeks['theta']:.1f} (限值 {self.max_theta})"
            )
        return violations

    def summary(self, greeks: dict) -> str:
        """Human-readable risk summary."""
        violations = self.check(greeks)
        if not violations:
            return "✅ 所有风险指标在限额内"
        return "\n".join(violations)


# ─── Timing guidelines (rule-based) ────────────────────────────────────

TIMING_RULES = {
    "sell_premium": {
        "best_dte": "30-45 DTE",
        "vol_condition": "IV Rank > 50%",
        "exit": "50% max profit 或 21 DTE (先到者)",
        "stop": "2x credit received",
        "rationale": "Theta衰减在30-45天开始加速，高IV给予更多安全边际",
    },
    "buy_premium": {
        "best_dte": "60-90 DTE",
        "vol_condition": "IV Rank < 30%",
        "exit": "50-100% profit",
        "stop": "50% of debit paid",
        "rationale": "远期合约Theta慢，低IV买入便宜，等待波动率回升",
    },
    "earnings_play": {
        "best_dte": "7-14 DTE (跨越财报日)",
        "vol_condition": "IV通常在财报前膨胀",
        "exit": "财报后立即评估，IV crush后快速了结",
        "stop": "根据策略最大亏损设定",
        "rationale": "利用IV膨胀卖权利金，或买跨式赌方向",
    },
    "hedging": {
        "best_dte": "与持仓期匹配",
        "vol_condition": "任何",
        "exit": "持仓了结时同步平仓对冲",
        "stop": "N/A (保护性质)",
        "rationale": "对冲重在保护，不在盈利",
    },
}


def get_timing_advice(scenario: str) -> dict | str:
    """Get timing/exit rules for a trading scenario."""
    if scenario in TIMING_RULES:
        return TIMING_RULES[scenario]
    return f"未知场景: {scenario}。可选: {list(TIMING_RULES.keys())}"
