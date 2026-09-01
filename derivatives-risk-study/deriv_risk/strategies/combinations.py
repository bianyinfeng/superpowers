"""
Option combination strategies library.

Each strategy is a dataclass that holds its legs and computes aggregate
payoff, P&L, and portfolio Greeks at any given spot price and time.
"""

from __future__ import annotations

import dataclasses
import numpy as np
import pandas as pd
from typing import Literal

from deriv_risk.pricing.black_scholes import bs_price, delta, gamma, theta, vega


@dataclasses.dataclass
class OptionLeg:
    """Single option leg in a strategy."""
    option_type: Literal["call", "put"]
    strike: float
    premium: float  # price paid (positive) or received (negative)
    quantity: int  # positive = long, negative = short
    expiry_T: float = 0.25  # time to expiry in years

    def payoff_at_expiry(self, S: float | np.ndarray) -> float | np.ndarray:
        if self.option_type == "call":
            intrinsic = np.maximum(S - self.strike, 0)
        else:
            intrinsic = np.maximum(self.strike - S, 0)
        return self.quantity * (intrinsic - self.premium)

    def current_value(self, S: float, T: float, r: float, sigma: float) -> float:
        price = bs_price(S, self.strike, T, r, sigma, self.option_type)
        return self.quantity * price

    def greeks(self, S: float, T: float, r: float, sigma: float) -> dict:
        return {
            "delta": self.quantity * delta(S, self.strike, T, r, sigma, self.option_type),
            "gamma": self.quantity * gamma(S, self.strike, T, r, sigma),
            "theta": self.quantity * theta(S, self.strike, T, r, sigma, self.option_type),
            "vega": self.quantity * vega(S, self.strike, T, r, sigma),
        }


@dataclasses.dataclass
class Strategy:
    """Multi-leg option strategy."""
    name: str
    legs: list[OptionLeg]
    underlying_qty: int = 0  # shares of underlying (for covered call, etc.)

    def payoff_at_expiry(self, S: float | np.ndarray) -> float | np.ndarray:
        total = sum(leg.payoff_at_expiry(S) for leg in self.legs)
        if self.underlying_qty != 0:
            # Assume underlying was purchased at the average strike for simplicity
            total = total + self.underlying_qty * S
        return total

    def total_premium(self) -> float:
        return sum(leg.quantity * leg.premium for leg in self.legs)

    def max_loss(self, S_range: np.ndarray) -> float:
        payoffs = self.payoff_at_expiry(S_range)
        return float(np.min(payoffs))

    def max_profit(self, S_range: np.ndarray) -> float:
        payoffs = self.payoff_at_expiry(S_range)
        return float(np.max(payoffs))

    def breakeven_points(self, S_range: np.ndarray) -> list[float]:
        payoffs = self.payoff_at_expiry(S_range)
        sign_changes = np.where(np.diff(np.sign(payoffs)))[0]
        # Linear interpolation for precision
        points = []
        for idx in sign_changes:
            s1, s2 = S_range[idx], S_range[idx + 1]
            p1, p2 = payoffs[idx], payoffs[idx + 1]
            cross = s1 - p1 * (s2 - s1) / (p2 - p1)
            points.append(float(cross))
        return points

    def portfolio_greeks(self, S: float, T: float, r: float, sigma: float) -> dict:
        totals = {"delta": 0.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0}
        for leg in self.legs:
            g = leg.greeks(S, T, r, sigma)
            for k in totals:
                totals[k] += g[k]
        if self.underlying_qty:
            totals["delta"] += self.underlying_qty
        return totals

    def payoff_table(self, S_range: np.ndarray) -> pd.DataFrame:
        df = pd.DataFrame({"Spot": S_range, "P&L": self.payoff_at_expiry(S_range)})
        for i, leg in enumerate(self.legs):
            df[f"Leg{i+1}_{leg.option_type}_{leg.strike}"] = leg.payoff_at_expiry(S_range)
        return df


# ─── Pre-built strategy constructors ───────────────────────────────────

def covered_call(S: float, K: float, call_premium: float, T: float = 0.25) -> Strategy:
    """Covered Call: long 100 shares + short 1 call."""
    return Strategy(
        name=f"Covered Call (K={K})",
        legs=[OptionLeg("call", K, call_premium, -1, T)],
        underlying_qty=100,
    )


def protective_put(S: float, K: float, put_premium: float, T: float = 0.25) -> Strategy:
    """Protective Put: long 100 shares + long 1 put."""
    return Strategy(
        name=f"Protective Put (K={K})",
        legs=[OptionLeg("put", K, put_premium, 1, T)],
        underlying_qty=100,
    )


def bull_call_spread(K_low: float, K_high: float, prem_low: float, prem_high: float, T: float = 0.25) -> Strategy:
    """Bull Call Spread: long call at K_low, short call at K_high."""
    return Strategy(
        name=f"Bull Call Spread ({K_low}/{K_high})",
        legs=[
            OptionLeg("call", K_low, prem_low, 1, T),
            OptionLeg("call", K_high, prem_high, -1, T),
        ],
    )


def bear_put_spread(K_low: float, K_high: float, prem_low: float, prem_high: float, T: float = 0.25) -> Strategy:
    """Bear Put Spread: long put at K_high, short put at K_low."""
    return Strategy(
        name=f"Bear Put Spread ({K_low}/{K_high})",
        legs=[
            OptionLeg("put", K_high, prem_high, 1, T),
            OptionLeg("put", K_low, prem_low, -1, T),
        ],
    )


def long_straddle(K: float, call_prem: float, put_prem: float, T: float = 0.25) -> Strategy:
    """Long Straddle: long call + long put at same strike."""
    return Strategy(
        name=f"Long Straddle (K={K})",
        legs=[
            OptionLeg("call", K, call_prem, 1, T),
            OptionLeg("put", K, put_prem, 1, T),
        ],
    )


def long_strangle(K_put: float, K_call: float, put_prem: float, call_prem: float, T: float = 0.25) -> Strategy:
    """Long Strangle: long OTM put + long OTM call."""
    return Strategy(
        name=f"Long Strangle ({K_put}/{K_call})",
        legs=[
            OptionLeg("put", K_put, put_prem, 1, T),
            OptionLeg("call", K_call, call_prem, 1, T),
        ],
    )


def iron_condor(
    K1: float, K2: float, K3: float, K4: float,
    p1: float, p2: float, p3: float, p4: float,
    T: float = 0.25,
) -> Strategy:
    """Iron Condor: short put K2, long put K1, short call K3, long call K4.

    K1 < K2 < K3 < K4.
    """
    return Strategy(
        name=f"Iron Condor ({K1}/{K2}/{K3}/{K4})",
        legs=[
            OptionLeg("put", K1, p1, 1, T),   # long put (wing)
            OptionLeg("put", K2, p2, -1, T),   # short put
            OptionLeg("call", K3, p3, -1, T),  # short call
            OptionLeg("call", K4, p4, 1, T),   # long call (wing)
        ],
    )


def butterfly_spread(K_low: float, K_mid: float, K_high: float, p_low: float, p_mid: float, p_high: float, T: float = 0.25) -> Strategy:
    """Long Butterfly with calls: long K_low, short 2×K_mid, long K_high."""
    return Strategy(
        name=f"Butterfly ({K_low}/{K_mid}/{K_high})",
        legs=[
            OptionLeg("call", K_low, p_low, 1, T),
            OptionLeg("call", K_mid, p_mid, -2, T),
            OptionLeg("call", K_high, p_high, 1, T),
        ],
    )


def calendar_spread(K: float, prem_near: float, prem_far: float, T_near: float = 0.08, T_far: float = 0.25) -> Strategy:
    """Calendar Spread: short near-term call + long far-term call at same strike."""
    return Strategy(
        name=f"Calendar Spread (K={K})",
        legs=[
            OptionLeg("call", K, prem_near, -1, T_near),
            OptionLeg("call", K, prem_far, 1, T_far),
        ],
    )
