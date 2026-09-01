"""
Black-Scholes option pricing and Greeks computation.

Supports European calls and puts with full first- and second-order Greeks,
plus implied volatility via Newton-Raphson.
"""

from __future__ import annotations

import numpy as np
from scipy.stats import norm


# ─── Core helpers ───────────────────────────────────────────────────────

def _d1(S: float, K: float, T: float, r: float, sigma: float) -> float:
    return (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))


def _d2(S: float, K: float, T: float, r: float, sigma: float) -> float:
    return _d1(S, K, T, r, sigma) - sigma * np.sqrt(T)


# ─── Pricing ────────────────────────────────────────────────────────────

def bs_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """European call price via Black-Scholes."""
    if T <= 0:
        return max(S - K, 0.0)
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)


def bs_put(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """European put price via Black-Scholes."""
    if T <= 0:
        return max(K - S, 0.0)
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def bs_price(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Price a European option. option_type: 'call' or 'put'."""
    if option_type == "call":
        return bs_call(S, K, T, r, sigma)
    return bs_put(S, K, T, r, sigma)


# ─── Greeks ─────────────────────────────────────────────────────────────

def delta(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Delta: ∂V/∂S."""
    if T <= 0:
        if option_type == "call":
            return 1.0 if S > K else 0.0
        return -1.0 if S < K else 0.0
    d1 = _d1(S, K, T, r, sigma)
    if option_type == "call":
        return norm.cdf(d1)
    return norm.cdf(d1) - 1


def gamma(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Gamma: ∂²V/∂S² (same for call and put)."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    return norm.pdf(d1) / (S * sigma * np.sqrt(T))


def theta(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Theta: ∂V/∂t (per calendar day)."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    common = -S * norm.pdf(d1) * sigma / (2 * np.sqrt(T))
    if option_type == "call":
        return (common - r * K * np.exp(-r * T) * norm.cdf(d2)) / 365
    return (common + r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365


def vega(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Vega: ∂V/∂σ (per 1% move, same for call and put)."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    return S * norm.pdf(d1) * np.sqrt(T) * 0.01


def rho(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Rho: ∂V/∂r (per 1% move)."""
    if T <= 0:
        return 0.0
    d2 = _d2(S, K, T, r, sigma)
    if option_type == "call":
        return K * T * np.exp(-r * T) * norm.cdf(d2) * 0.01
    return -K * T * np.exp(-r * T) * norm.cdf(-d2) * 0.01


def vanna(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Vanna: ∂²V/(∂S∂σ) = ∂delta/∂sigma."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    return -norm.pdf(d1) * d2 / sigma


def charm(S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call") -> float:
    """Charm: ∂delta/∂t (delta decay)."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    pdf_d1 = norm.pdf(d1)
    term = 2 * r * T - d2 * sigma * np.sqrt(T)
    base = pdf_d1 * term / (2 * T * sigma * np.sqrt(T))
    if option_type == "call":
        return -base / 365
    return -base / 365


def volga(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Volga (Vomma): ∂²V/∂σ² = vega * d1*d2/sigma."""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = d1 - sigma * np.sqrt(T)
    v = vega(S, K, T, r, sigma) * 100  # undo the 0.01 scaling
    return v * d1 * d2 / sigma


# ─── Greeks surface (vectorized) ───────────────────────────────────────

def greeks_surface(
    S_range: np.ndarray,
    K: float,
    T_range: np.ndarray,
    r: float,
    sigma: float,
    option_type: str = "call",
) -> dict[str, np.ndarray]:
    """Compute a 2-D grid of prices and Greeks over (S, T).

    Returns dict with keys: price, delta, gamma, theta, vega, rho.
    Each value is a 2-D array of shape (len(T_range), len(S_range)).
    """
    S_grid, T_grid = np.meshgrid(S_range, T_range)
    results = {}
    # Vectorised Black-Scholes
    T_safe = np.maximum(T_grid, 1e-10)
    d1 = (np.log(S_grid / K) + (r + 0.5 * sigma**2) * T_safe) / (sigma * np.sqrt(T_safe))
    d2 = d1 - sigma * np.sqrt(T_safe)

    if option_type == "call":
        results["price"] = S_grid * norm.cdf(d1) - K * np.exp(-r * T_safe) * norm.cdf(d2)
        results["delta"] = norm.cdf(d1)
        results["rho"] = K * T_safe * np.exp(-r * T_safe) * norm.cdf(d2) * 0.01
        theta_val = (-S_grid * norm.pdf(d1) * sigma / (2 * np.sqrt(T_safe))
                     - r * K * np.exp(-r * T_safe) * norm.cdf(d2)) / 365
    else:
        results["price"] = K * np.exp(-r * T_safe) * norm.cdf(-d2) - S_grid * norm.cdf(-d1)
        results["delta"] = norm.cdf(d1) - 1
        results["rho"] = -K * T_safe * np.exp(-r * T_safe) * norm.cdf(-d2) * 0.01
        theta_val = (-S_grid * norm.pdf(d1) * sigma / (2 * np.sqrt(T_safe))
                     + r * K * np.exp(-r * T_safe) * norm.cdf(-d2)) / 365

    results["gamma"] = norm.pdf(d1) / (S_grid * sigma * np.sqrt(T_safe))
    results["theta"] = theta_val
    results["vega"] = S_grid * norm.pdf(d1) * np.sqrt(T_safe) * 0.01
    return results


# ─── Implied volatility ────────────────────────────────────────────────

def implied_volatility(
    market_price: float,
    S: float,
    K: float,
    T: float,
    r: float,
    option_type: str = "call",
    tol: float = 1e-6,
    max_iter: int = 100,
) -> float:
    """Compute implied volatility via Newton-Raphson on vega."""
    sigma_est = 0.3  # initial guess
    for _ in range(max_iter):
        price = bs_price(S, K, T, r, sigma_est, option_type)
        v = vega(S, K, T, r, sigma_est) * 100  # vega returns per-1%-move
        if abs(v) < 1e-12:
            break
        sigma_est -= (price - market_price) / v
        sigma_est = max(sigma_est, 0.001)
        if abs(price - market_price) < tol:
            break
    return sigma_est
