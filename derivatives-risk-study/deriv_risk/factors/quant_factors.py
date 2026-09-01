"""
Quantitative factors for derivatives trading decisions.

Includes: volatility regime, mean-reversion, momentum, term structure,
put-call ratio, skew, and Greeks-based signals.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from deriv_risk.data.market_data import compute_historical_volatility, compute_returns


# ─── Volatility factors ────────────────────────────────────────────────

def volatility_regime(
    prices: pd.Series, short_window: int = 21, long_window: int = 63
) -> pd.DataFrame:
    """Classify volatility regime: low / normal / high.

    Compares short-term vs long-term realized vol.
    """
    short_vol = compute_historical_volatility(prices, short_window)
    long_vol = compute_historical_volatility(prices, long_window)
    ratio = short_vol / long_vol

    regime = pd.Series("normal", index=prices.index)
    regime[ratio > 1.2] = "high"
    regime[ratio < 0.8] = "low"

    return pd.DataFrame({
        "short_vol": short_vol,
        "long_vol": long_vol,
        "vol_ratio": ratio,
        "regime": regime,
    })


def volatility_percentile(
    prices: pd.Series, lookback: int = 252
) -> pd.Series:
    """Rolling percentile rank of current vol within lookback window."""
    vol = compute_historical_volatility(prices, 21)
    return vol.rolling(lookback).apply(
        lambda x: pd.Series(x).rank(pct=True).iloc[-1], raw=False
    )


# ─── Momentum / mean-reversion ─────────────────────────────────────────

def rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index."""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0.0).rolling(period).mean()
    loss = (-delta.where(delta < 0, 0.0)).rolling(period).mean()
    rs = gain / loss
    return 100 - 100 / (1 + rs)


def bollinger_bands(
    prices: pd.Series, window: int = 20, num_std: float = 2.0
) -> pd.DataFrame:
    """Bollinger Bands with %B indicator."""
    sma = prices.rolling(window).mean()
    std = prices.rolling(window).std()
    upper = sma + num_std * std
    lower = sma - num_std * std
    pct_b = (prices - lower) / (upper - lower)
    return pd.DataFrame({
        "upper": upper,
        "middle": sma,
        "lower": lower,
        "pct_b": pct_b,
    })


def macd(
    prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> pd.DataFrame:
    """MACD indicator."""
    ema_fast = prices.ewm(span=fast).mean()
    ema_slow = prices.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    histogram = macd_line - signal_line
    return pd.DataFrame({
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram,
    })


# ─── Options-specific factors ──────────────────────────────────────────

def put_call_ratio(put_volume: pd.Series, call_volume: pd.Series) -> pd.Series:
    """Put/Call volume ratio — a sentiment indicator."""
    return put_volume / call_volume


def iv_hv_spread(
    implied_vol: pd.Series, prices: pd.Series, window: int = 21
) -> pd.Series:
    """IV-HV spread: implied vol minus realized vol.

    Positive → options are 'expensive' (high risk premium).
    Negative → options are 'cheap'.
    """
    hv = compute_historical_volatility(prices, window)
    return implied_vol - hv


def skew_index(
    otm_put_iv: float, atm_iv: float, otm_call_iv: float
) -> dict:
    """Simple skew measures.

    Returns:
        put_skew: OTM Put IV - ATM IV (usually positive = fear premium).
        call_skew: OTM Call IV - ATM IV.
        skew_ratio: put_skew / call_skew.
    """
    put_skew = otm_put_iv - atm_iv
    call_skew = otm_call_iv - atm_iv
    skew_ratio = put_skew / call_skew if abs(call_skew) > 1e-8 else float("inf")
    return {"put_skew": put_skew, "call_skew": call_skew, "skew_ratio": skew_ratio}


# ─── Term structure factor ──────────────────────────────────────────────

def term_structure_slope(
    near_iv: float, far_iv: float
) -> float:
    """Term structure slope: far IV - near IV.

    Negative (backwardation) → near-term uncertainty, often bearish.
    Positive (contango) → normal market.
    """
    return far_iv - near_iv


# ─── Greeks-based trading signals ───────────────────────────────────────

def gamma_exposure_signal(portfolio_gamma: float, threshold: float = 5.0) -> str:
    """Signal based on portfolio gamma exposure.

    High positive gamma → profit from moves (good for long vol).
    High negative gamma → danger zone (short vol sellers beware).
    """
    if portfolio_gamma > threshold:
        return "HIGH_POSITIVE_GAMMA: 大幅波动有利"
    elif portfolio_gamma < -threshold:
        return "HIGH_NEGATIVE_GAMMA: ⚠️ 大幅波动危险，考虑减仓"
    return "NEUTRAL_GAMMA"


def theta_decay_warning(portfolio_theta: float, days_to_expiry: int) -> str:
    """Warn about accelerating theta decay near expiry."""
    if days_to_expiry <= 7 and portfolio_theta < -0.5:
        return "⚠️ 最后一周Theta加速衰减! 日损耗: {:.2f}".format(abs(portfolio_theta))
    if days_to_expiry <= 14 and portfolio_theta < -0.3:
        return "注意: 两周内Theta衰减加速"
    return "Theta正常"
