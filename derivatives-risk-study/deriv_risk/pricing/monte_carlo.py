"""
Monte Carlo simulation for option pricing and risk analysis.

Supports path-dependent analysis and VaR/CVaR estimation.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def simulate_gbm_paths(
    S0: float,
    mu: float,
    sigma: float,
    T: float,
    n_steps: int = 252,
    n_paths: int = 10_000,
    seed: int | None = 42,
) -> np.ndarray:
    """Simulate GBM price paths.

    Returns:
        Array of shape (n_paths, n_steps + 1) with S0 at column 0.
    """
    rng = np.random.default_rng(seed)
    dt = T / n_steps
    Z = rng.standard_normal((n_paths, n_steps))
    increments = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z
    log_paths = np.zeros((n_paths, n_steps + 1))
    log_paths[:, 0] = np.log(S0)
    log_paths[:, 1:] = np.cumsum(increments, axis=1) + np.log(S0)
    return np.exp(log_paths)


def mc_european_option(
    S0: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: str = "call",
    n_paths: int = 100_000,
    seed: int = 42,
) -> dict:
    """Monte Carlo European option pricing.

    Returns dict with 'price', 'std_error', 'ci_lower', 'ci_upper'.
    """
    paths = simulate_gbm_paths(S0, r, sigma, T, n_steps=1, n_paths=n_paths, seed=seed)
    ST = paths[:, -1]
    if option_type == "call":
        payoffs = np.maximum(ST - K, 0)
    else:
        payoffs = np.maximum(K - ST, 0)
    discounted = np.exp(-r * T) * payoffs
    price = discounted.mean()
    std_err = discounted.std() / np.sqrt(n_paths)
    return {
        "price": price,
        "std_error": std_err,
        "ci_lower": price - 1.96 * std_err,
        "ci_upper": price + 1.96 * std_err,
    }


def compute_var_cvar(
    returns: np.ndarray | pd.Series,
    confidence: float = 0.95,
) -> dict:
    """Compute Value-at-Risk and Conditional VaR (Expected Shortfall).

    Args:
        returns: Array of portfolio returns.
        confidence: Confidence level (e.g. 0.95 for 95% VaR).

    Returns:
        Dict with 'VaR' and 'CVaR' (both as positive loss numbers).
    """
    arr = np.asarray(returns)
    var_level = np.percentile(arr, (1 - confidence) * 100)
    cvar = arr[arr <= var_level].mean()
    return {"VaR": -var_level, "CVaR": -cvar}
