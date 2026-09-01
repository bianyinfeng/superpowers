"""
Futures pricing and risk measures.

Covers: cost-of-carry model, basis analysis, margin/leverage,
and futures-specific Greeks (for options on futures via Black-76).
"""

from __future__ import annotations

import numpy as np
from scipy.stats import norm


# ─── Cost-of-carry / Fair value ─────────────────────────────────────────

def futures_fair_value(
    S: float, r: float, T: float, q: float = 0.0, storage: float = 0.0
) -> float:
    """Futures fair value: F = S * exp((r - q + c) * T).

    Args:
        S: Spot price.
        r: Risk-free rate.
        T: Time to expiry in years.
        q: Continuous dividend / convenience yield.
        storage: Storage cost rate.
    """
    return S * np.exp((r - q + storage) * T)


def basis(spot: float, futures: float) -> float:
    """Basis = Futures - Spot."""
    return futures - spot


def basis_percentage(spot: float, futures: float) -> float:
    """Basis as % of spot."""
    return (futures - spot) / spot * 100


# ─── Black-76 model (options on futures) ────────────────────────────────

def _d1_76(F: float, K: float, T: float, r: float, sigma: float) -> float:
    return (np.log(F / K) + 0.5 * sigma**2 * T) / (sigma * np.sqrt(T))


def black76_call(F: float, K: float, T: float, r: float, sigma: float) -> float:
    """European call on futures via Black-76."""
    if T <= 0:
        return max(F - K, 0.0)
    d1 = _d1_76(F, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    return np.exp(-r * T) * (F * norm.cdf(d1) - K * norm.cdf(d2))


def black76_put(F: float, K: float, T: float, r: float, sigma: float) -> float:
    """European put on futures via Black-76."""
    if T <= 0:
        return max(K - F, 0.0)
    d1 = _d1_76(F, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    return np.exp(-r * T) * (K * norm.cdf(-d2) - F * norm.cdf(-d1))


def black76_delta(F: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Delta for Black-76 option on futures."""
    if T <= 0:
        if option_type == "call":
            return 1.0 if F > K else 0.0
        return -1.0 if F < K else 0.0
    d1 = _d1_76(F, K, T, r, sigma)
    if option_type == "call":
        return np.exp(-r * T) * norm.cdf(d1)
    return np.exp(-r * T) * (norm.cdf(d1) - 1)


# ─── Margin & leverage ──────────────────────────────────────────────────

def futures_leverage(contract_value: float, margin: float) -> float:
    """Effective leverage = contract value / margin."""
    return contract_value / margin


def daily_pnl(
    entry: float, exit_price: float, multiplier: float = 1.0, contracts: int = 1
) -> float:
    """P&L for a futures position."""
    return (exit_price - entry) * multiplier * contracts


def margin_utilization(unrealized_pnl: float, margin: float) -> float:
    """Margin utilization ratio (negative = loss eating into margin)."""
    return (margin + unrealized_pnl) / margin
