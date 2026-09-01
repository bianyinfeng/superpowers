"""
Interactive visualization for option/futures risk analysis.

Plotly-based charts and animations for:
- Payoff diagrams
- Greeks surfaces (3-D and animated over time)
- P&L heat maps
- Volatility smile / surface
- Monte Carlo fan charts
"""

from __future__ import annotations

import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from deriv_risk.pricing.black_scholes import (
    bs_price, delta, gamma, theta, vega, greeks_surface,
)
from deriv_risk.strategies.combinations import Strategy


# ─── Payoff diagrams ───────────────────────────────────────────────────

def plot_payoff(
    strategy: Strategy,
    S_range: np.ndarray | None = None,
    center: float | None = None,
    width_pct: float = 0.3,
    show: bool = True,
) -> go.Figure:
    """Plot expiry payoff diagram for a strategy."""
    if S_range is None:
        strikes = [leg.strike for leg in strategy.legs]
        center = center or np.mean(strikes)
        S_range = np.linspace(center * (1 - width_pct), center * (1 + width_pct), 500)

    fig = go.Figure()
    # Individual legs
    for i, leg in enumerate(strategy.legs):
        fig.add_trace(go.Scatter(
            x=S_range, y=leg.payoff_at_expiry(S_range),
            mode="lines", opacity=0.4,
            name=f"Leg{i+1}: {'+' if leg.quantity > 0 else ''}{leg.quantity}×{leg.option_type.upper()} K={leg.strike}",
            line=dict(dash="dot"),
        ))
    # Total strategy payoff
    fig.add_trace(go.Scatter(
        x=S_range, y=strategy.payoff_at_expiry(S_range),
        mode="lines", name="Total P&L",
        line=dict(width=3, color="red"),
    ))
    # Zero line
    fig.add_hline(y=0, line_dash="dash", line_color="gray", opacity=0.5)
    # Breakeven points
    beps = strategy.breakeven_points(S_range)
    for bp in beps:
        fig.add_vline(x=bp, line_dash="dash", line_color="green", opacity=0.6,
                       annotation_text=f"BE={bp:.1f}")

    fig.update_layout(
        title=f"到期损益图 | {strategy.name}",
        xaxis_title="标的价格 (Spot Price)",
        yaxis_title="损益 (P&L)",
        template="plotly_white",
        hovermode="x unified",
    )
    if show:
        fig.show()
    return fig


# ─── Greeks evolution animation ────────────────────────────────────────

def animate_greeks_over_time(
    K: float = 100,
    r: float = 0.05,
    sigma: float = 0.25,
    option_type: str = "call",
    S_range: np.ndarray | None = None,
    T_values: np.ndarray | None = None,
    show: bool = True,
) -> go.Figure:
    """Animated chart showing how Greeks change as time passes.

    Slider controls remaining time-to-expiry.
    """
    if S_range is None:
        S_range = np.linspace(K * 0.6, K * 1.4, 300)
    if T_values is None:
        T_values = np.array([1.0, 0.75, 0.5, 0.25, 0.1, 0.05, 0.01])

    greek_funcs = {
        "Delta": lambda S, T: delta(S, K, T, r, sigma, option_type),
        "Gamma": lambda S, T: gamma(S, K, T, r, sigma),
        "Theta": lambda S, T: theta(S, K, T, r, sigma, option_type),
        "Vega": lambda S, T: vega(S, K, T, r, sigma),
    }

    fig = make_subplots(rows=2, cols=2, subplot_titles=list(greek_funcs.keys()))

    # Build frames
    frames = []
    for t_idx, T in enumerate(T_values):
        frame_data = []
        for g_name, g_func in greek_funcs.items():
            vals = np.array([g_func(float(s), float(T)) for s in S_range])
            frame_data.append(go.Scatter(x=S_range, y=vals, mode="lines", name=g_name))
        frames.append(go.Frame(data=frame_data, name=f"T={T:.2f}"))

    # Initial traces (T=1)
    for i, (g_name, g_func) in enumerate(greek_funcs.items()):
        vals = np.array([g_func(float(s), float(T_values[0])) for s in S_range])
        row, col = divmod(i, 2)
        fig.add_trace(
            go.Scatter(x=S_range, y=vals, mode="lines", name=g_name, line=dict(width=2)),
            row=row + 1, col=col + 1,
        )

    # Slider
    sliders = [dict(
        active=0,
        steps=[dict(
            method="animate",
            args=[[f"T={T:.2f}"], dict(mode="immediate", frame=dict(duration=300))],
            label=f"T={T:.2f}y",
        ) for T in T_values],
        currentvalue=dict(prefix="到期剩余: "),
    )]

    fig.update_layout(
        title=f"Greeks随时间变化 | {option_type.upper()} K={K} σ={sigma}",
        template="plotly_white",
        sliders=sliders,
        showlegend=False,
    )
    fig.frames = frames

    if show:
        fig.show()
    return fig


# ─── 3-D Greeks surface ────────────────────────────────────────────────

def plot_greeks_3d(
    greek_name: str = "delta",
    K: float = 100,
    r: float = 0.05,
    sigma: float = 0.25,
    option_type: str = "call",
    S_range: np.ndarray | None = None,
    T_range: np.ndarray | None = None,
    show: bool = True,
) -> go.Figure:
    """3-D surface plot of a Greek over (Spot, Time)."""
    if S_range is None:
        S_range = np.linspace(K * 0.7, K * 1.3, 100)
    if T_range is None:
        T_range = np.linspace(0.01, 1.0, 60)

    surfaces = greeks_surface(S_range, K, T_range, r, sigma, option_type)
    Z = surfaces[greek_name]

    fig = go.Figure(data=[go.Surface(
        x=S_range, y=T_range, z=Z,
        colorscale="RdYlBu_r",
        colorbar=dict(title=greek_name.capitalize()),
    )])
    fig.update_layout(
        title=f"{greek_name.capitalize()} 曲面 | {option_type.upper()} K={K}",
        scene=dict(
            xaxis_title="标的价格",
            yaxis_title="到期时间 (年)",
            zaxis_title=greek_name.capitalize(),
        ),
        template="plotly_white",
    )
    if show:
        fig.show()
    return fig


# ─── Volatility smile ──────────────────────────────────────────────────

def plot_vol_smile(
    strikes: np.ndarray,
    ivs: np.ndarray,
    title: str = "Implied Volatility Smile",
    show: bool = True,
) -> go.Figure:
    """Plot implied volatility smile/skew."""
    fig = go.Figure(go.Scatter(
        x=strikes, y=ivs * 100,
        mode="lines+markers",
        name="IV",
        line=dict(width=2, color="purple"),
    ))
    fig.update_layout(
        title=title,
        xaxis_title="行权价 (Strike)",
        yaxis_title="隐含波动率 (%)",
        template="plotly_white",
    )
    if show:
        fig.show()
    return fig


# ─── Monte Carlo fan chart ─────────────────────────────────────────────

def plot_mc_paths(
    paths: np.ndarray,
    n_display: int = 200,
    percentiles: tuple = (5, 25, 50, 75, 95),
    show: bool = True,
) -> go.Figure:
    """Fan chart of Monte Carlo simulation paths with percentile bands."""
    fig = go.Figure()
    # Sample paths
    idx = np.random.choice(paths.shape[0], min(n_display, paths.shape[0]), replace=False)
    for i in idx:
        fig.add_trace(go.Scatter(
            y=paths[i], mode="lines", opacity=0.05,
            line=dict(width=0.5, color="steelblue"),
            showlegend=False,
        ))
    # Percentile bands
    colors = ["rgba(255,0,0,0.2)", "rgba(255,165,0,0.3)", "rgba(0,128,0,0.6)",
              "rgba(255,165,0,0.3)", "rgba(255,0,0,0.2)"]
    for p, c in zip(percentiles, colors):
        vals = np.percentile(paths, p, axis=0)
        fig.add_trace(go.Scatter(
            y=vals, mode="lines",
            name=f"P{p}",
            line=dict(width=2, color=c.replace(",0.", ",1.")),
        ))

    fig.update_layout(
        title="蒙特卡洛模拟路径 | Monte Carlo Paths",
        xaxis_title="交易日",
        yaxis_title="价格",
        template="plotly_white",
    )
    if show:
        fig.show()
    return fig


# ─── P&L Heatmap ───────────────────────────────────────────────────────

def plot_pnl_heatmap(
    strategy: Strategy,
    r: float = 0.05,
    sigma: float = 0.25,
    S_range: np.ndarray | None = None,
    T_range: np.ndarray | None = None,
    show: bool = True,
) -> go.Figure:
    """P&L heatmap over (Spot, Time) for a strategy."""
    strikes = [leg.strike for leg in strategy.legs]
    center = np.mean(strikes)
    if S_range is None:
        S_range = np.linspace(center * 0.7, center * 1.3, 100)
    if T_range is None:
        T_range = np.linspace(0.01, 0.5, 50)

    initial_cost = strategy.total_premium()
    Z = np.zeros((len(T_range), len(S_range)))
    for i, T in enumerate(T_range):
        for j, S in enumerate(S_range):
            val = sum(
                leg.current_value(float(S), float(T), r, sigma) for leg in strategy.legs
            )
            Z[i, j] = val - initial_cost

    fig = go.Figure(data=go.Heatmap(
        x=S_range, y=T_range, z=Z,
        colorscale="RdYlGn",
        colorbar=dict(title="P&L"),
    ))
    fig.update_layout(
        title=f"损益热力图 | {strategy.name}",
        xaxis_title="标的价格",
        yaxis_title="到期时间 (年)",
        template="plotly_white",
    )
    if show:
        fig.show()
    return fig
