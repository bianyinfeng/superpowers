"""
Historical market data fetcher using yfinance.

Provides functions to download stock/ETF/futures price data,
compute historical volatility, and prepare data for pricing models.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

try:
    import yfinance as yf
except ImportError:
    yf = None  # Allow module to load without yfinance for testing


def fetch_ohlcv(
    ticker: str,
    start: str = "2020-01-01",
    end: str | None = None,
    interval: str = "1d",
) -> pd.DataFrame:
    """Download OHLCV data for a ticker.

    Args:
        ticker: Yahoo Finance ticker symbol (e.g. 'AAPL', 'SPY', 'ES=F').
        start: Start date string 'YYYY-MM-DD'.
        end: End date string (default: today).
        interval: Data interval ('1d', '1wk', '1mo', etc.).

    Returns:
        DataFrame with columns [Open, High, Low, Close, Volume].
    """
    if yf is None:
        raise ImportError("yfinance is required. Install with: pip install yfinance")
    data = yf.download(ticker, start=start, end=end, interval=interval, progress=False)
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.droplevel(1)
    return data


def compute_historical_volatility(
    prices: pd.Series, window: int = 21, annualize: bool = True
) -> pd.Series:
    """Compute rolling historical (realized) volatility from close prices.

    Args:
        prices: Series of close prices.
        window: Rolling window in trading days (default 21 ≈ 1 month).
        annualize: Whether to annualize (multiply by sqrt(252)).

    Returns:
        Series of rolling volatility.
    """
    log_returns = np.log(prices / prices.shift(1))
    vol = log_returns.rolling(window=window).std()
    if annualize:
        vol *= np.sqrt(252)
    return vol


def compute_returns(prices: pd.Series, log: bool = True) -> pd.Series:
    """Compute period returns from price series."""
    if log:
        return np.log(prices / prices.shift(1))
    return prices.pct_change()


def compute_correlation_matrix(
    tickers: list[str], start: str = "2020-01-01"
) -> pd.DataFrame:
    """Compute correlation matrix of log returns across tickers."""
    if yf is None:
        raise ImportError("yfinance is required")
    data = yf.download(tickers, start=start, progress=False)["Close"]
    if isinstance(data, pd.Series):
        data = data.to_frame()
    returns = np.log(data / data.shift(1)).dropna()
    return returns.corr()


# ---------------------------------------------------------------------------
# Synthetic / fallback data for environments without internet access
# ---------------------------------------------------------------------------

def generate_synthetic_prices(
    s0: float = 100.0,
    mu: float = 0.08,
    sigma: float = 0.25,
    days: int = 504,
    seed: int = 42,
) -> pd.DataFrame:
    """Generate synthetic daily OHLCV data via geometric Brownian motion.

    Useful when yfinance is unavailable or for reproducible demos.
    """
    rng = np.random.default_rng(seed)
    dt = 1 / 252
    log_returns = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rng.standard_normal(days)
    close = s0 * np.exp(np.cumsum(log_returns))
    # Fabricate OHLV from close
    noise = rng.uniform(0.995, 1.005, size=(days, 2))
    high = close * np.maximum(noise[:, 0], noise[:, 1]) * 1.005
    low = close * np.minimum(noise[:, 0], noise[:, 1]) * 0.995
    open_ = close * noise[:, 0]
    volume = rng.integers(1_000_000, 10_000_000, size=days)
    dates = pd.bdate_range(end=pd.Timestamp.today(), periods=days)
    return pd.DataFrame(
        {"Open": open_, "High": high, "Low": low, "Close": close, "Volume": volume},
        index=dates,
    )
