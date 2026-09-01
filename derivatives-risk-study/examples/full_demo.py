#!/usr/bin/env python3
"""
完整实例：期权期货风险测度研究
Complete Example: Options & Futures Risk Measures Study

本脚本演示所有核心功能：
1. 获取真实历史数据 (或使用合成数据)
2. 计算期权定价与Greeks
3. 构建各种组合策略并绘制损益图
4. 3D Greeks曲面与时间动画
5. 蒙特卡洛模拟与VaR/CVaR
6. 量化因子计算与波动率分析
7. 仓位管理与风险控制

Usage:
    python examples/full_demo.py          # 使用合成数据 (无需网络)
    python examples/full_demo.py --live   # 使用真实yfinance数据
"""

from __future__ import annotations

import sys
import numpy as np
import pandas as pd

# ─── Imports from our library ───────────────────────────────────────────
sys.path.insert(0, ".")

from deriv_risk.data.market_data import (
    generate_synthetic_prices,
    compute_historical_volatility,
    compute_returns,
)
from deriv_risk.pricing.black_scholes import (
    bs_call, bs_put, bs_price,
    delta, gamma, theta, vega, rho,
    vanna, charm, volga,
    implied_volatility,
    greeks_surface,
)
from deriv_risk.pricing.futures import (
    futures_fair_value, basis, futures_leverage, daily_pnl,
)
from deriv_risk.pricing.monte_carlo import (
    simulate_gbm_paths, mc_european_option, compute_var_cvar,
)
from deriv_risk.strategies.combinations import (
    Strategy, OptionLeg,
    covered_call, protective_put,
    bull_call_spread, bear_put_spread,
    long_straddle, long_strangle,
    iron_condor, butterfly_spread,
)
from deriv_risk.visualization.charts import (
    plot_payoff, animate_greeks_over_time,
    plot_greeks_3d, plot_mc_paths, plot_pnl_heatmap,
    plot_vol_smile,
)
from deriv_risk.factors.quant_factors import (
    volatility_regime, volatility_percentile,
    rsi, bollinger_bands, macd,
    iv_hv_spread, skew_index, term_structure_slope,
    gamma_exposure_signal, theta_decay_warning,
)
from deriv_risk.risk_mgmt.position_sizing import (
    kelly_fraction, half_kelly, fixed_fractional_size,
    atr_stop, risk_reward_ratio,
    RiskLimits, get_timing_advice,
)


def separator(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def main(use_live_data: bool = False):
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. 获取市场数据
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("1. 市场数据 | Market Data")

    if use_live_data:
        from deriv_risk.data.market_data import fetch_ohlcv
        print("正在下载SPY历史数据...")
        df = fetch_ohlcv("SPY", start="2022-01-01")
    else:
        print("使用合成数据 (GBM模拟, S0=450, σ=25%)...")
        df = generate_synthetic_prices(s0=450, sigma=0.25, days=504)

    prices = df["Close"]
    print(f"数据范围: {df.index[0].date()} ~ {df.index[-1].date()}")
    print(f"当前价格: {prices.iloc[-1]:.2f}")

    # 历史波动率
    hv = compute_historical_volatility(prices)
    print(f"21日年化历史波动率: {hv.iloc[-1]:.1%}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. 单个期权定价与Greeks
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("2. 单个期权定价 | Single Option Pricing")

    S = float(prices.iloc[-1])  # 当前价格
    K = round(S / 5) * 5         # 最近的5整数行权价
    T = 30 / 365                 # 30天到期
    r = 0.05                     # 无风险利率
    sigma = float(hv.iloc[-1])   # 使用历史波动率

    call_price = bs_call(S, K, T, r, sigma)
    put_price = bs_put(S, K, T, r, sigma)

    print(f"标的: S = {S:.2f}")
    print(f"行权价: K = {K}")
    print(f"到期: T = {T:.4f} 年 ({int(T*365)} 天)")
    print(f"波动率: σ = {sigma:.2%}")
    print(f"\nCall价格: {call_price:.4f}")
    print(f"Put价格:  {put_price:.4f}")
    print(f"Put-Call Parity检验: C - P = {call_price - put_price:.4f}, "
          f"S - K*e^(-rT) = {S - K * np.exp(-r*T):.4f}")

    # Greeks
    print("\n--- Greeks ---")
    for name, func in [
        ("Delta", lambda: delta(S, K, T, r, sigma, "call")),
        ("Gamma", lambda: gamma(S, K, T, r, sigma)),
        ("Theta", lambda: theta(S, K, T, r, sigma, "call")),
        ("Vega",  lambda: vega(S, K, T, r, sigma)),
        ("Rho",   lambda: rho(S, K, T, r, sigma, "call")),
        ("Vanna", lambda: vanna(S, K, T, r, sigma)),
        ("Charm", lambda: charm(S, K, T, r, sigma, "call")),
        ("Volga", lambda: volga(S, K, T, r, sigma)),
    ]:
        print(f"  {name:8s}: {func():.6f}")

    # 隐含波动率反算
    iv = implied_volatility(call_price, S, K, T, r, "call")
    print(f"\n隐含波动率反算: {iv:.4%} (输入σ={sigma:.4%})")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. 期货定价
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("3. 期货定价 | Futures Pricing")

    F = futures_fair_value(S, r, T=0.25, q=0.015)
    print(f"3个月期货合理价值: {F:.2f}")
    print(f"基差 (假设市场报价{F+2:.2f}): {basis(S, F+2):.2f}")
    print(f"杠杆 (合约价值{S*50:.0f}, 保证金{S*50*0.1:.0f}): "
          f"{futures_leverage(S*50, S*50*0.1):.1f}x")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. 组合策略损益分析
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("4. 组合策略 | Combination Strategies")

    S_range = np.linspace(K * 0.7, K * 1.3, 500)

    strategies = {
        "Covered Call (备兑开仓)": covered_call(S, K * 1.05, bs_call(S, K * 1.05, T, r, sigma)),
        "Protective Put (保护性看跌)": protective_put(S, K * 0.95, bs_put(S, K * 0.95, T, r, sigma)),
        "Bull Call Spread (牛市价差)": bull_call_spread(
            K * 0.95, K * 1.05,
            bs_call(S, K * 0.95, T, r, sigma),
            bs_call(S, K * 1.05, T, r, sigma),
        ),
        "Bear Put Spread (熊市价差)": bear_put_spread(
            K * 0.95, K * 1.05,
            bs_put(S, K * 0.95, T, r, sigma),
            bs_put(S, K * 1.05, T, r, sigma),
        ),
        "Long Straddle (跨式)": long_straddle(K, bs_call(S, K, T, r, sigma), bs_put(S, K, T, r, sigma)),
        "Long Strangle (宽跨式)": long_strangle(
            K * 0.95, K * 1.05,
            bs_put(S, K * 0.95, T, r, sigma),
            bs_call(S, K * 1.05, T, r, sigma),
        ),
        "Iron Condor (铁鹰)": iron_condor(
            K * 0.9, K * 0.95, K * 1.05, K * 1.1,
            bs_put(S, K * 0.9, T, r, sigma),
            bs_put(S, K * 0.95, T, r, sigma),
            bs_call(S, K * 1.05, T, r, sigma),
            bs_call(S, K * 1.1, T, r, sigma),
        ),
        "Butterfly (蝶式)": butterfly_spread(
            K * 0.95, K, K * 1.05,
            bs_call(S, K * 0.95, T, r, sigma),
            bs_call(S, K, T, r, sigma),
            bs_call(S, K * 1.05, T, r, sigma),
        ),
    }

    for name, strat in strategies.items():
        beps = strat.breakeven_points(S_range)
        greeks = strat.portfolio_greeks(S, T, r, sigma)
        print(f"\n📊 {name}")
        print(f"   净权利金: {strat.total_premium():.4f}")
        print(f"   最大亏损: {strat.max_loss(S_range):.2f}")
        print(f"   最大盈利: {strat.max_profit(S_range):.2f}")
        print(f"   盈亏平衡: {[f'{b:.1f}' for b in beps]}")
        print(f"   Greeks → Δ={greeks['delta']:.3f} Γ={greeks['gamma']:.4f} "
              f"Θ={greeks['theta']:.4f} V={greeks['vega']:.4f}")

    # 生成图表 (保存为HTML)
    print("\n生成损益图...")
    for name, strat in strategies.items():
        fig = plot_payoff(strat, S_range, show=False)
        safe_name = name.split("(")[0].strip().replace(" ", "_").lower()
        fig.write_html(f"examples/output_{safe_name}.html")
        print(f"  ✓ examples/output_{safe_name}.html")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. Greeks 3D曲面 & 时间动画
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("5. Greeks 3D曲面 | Greeks Surfaces")

    for greek_name in ["price", "delta", "gamma", "theta", "vega"]:
        fig = plot_greeks_3d(greek_name, K=K, sigma=sigma, show=False)
        fig.write_html(f"examples/output_3d_{greek_name}.html")
        print(f"  ✓ examples/output_3d_{greek_name}.html")

    # Greeks动画
    fig = animate_greeks_over_time(K=K, sigma=sigma, show=False)
    fig.write_html(f"examples/output_greeks_animation.html")
    print(f"  ✓ examples/output_greeks_animation.html")

    # P&L热力图
    strat = strategies["Iron Condor (铁鹰)"]
    fig = plot_pnl_heatmap(strat, sigma=sigma, show=False)
    fig.write_html("examples/output_pnl_heatmap.html")
    print(f"  ✓ examples/output_pnl_heatmap.html")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. 蒙特卡洛模拟
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("6. 蒙特卡洛模拟 | Monte Carlo Simulation")

    # MC期权定价
    mc_result = mc_european_option(S, K, T, r, sigma, "call", n_paths=100_000)
    print(f"MC Call价格: {mc_result['price']:.4f} ± {mc_result['std_error']:.4f}")
    print(f"BS Call价格: {call_price:.4f}")
    print(f"95%置信区间: [{mc_result['ci_lower']:.4f}, {mc_result['ci_upper']:.4f}]")

    # 模拟路径
    paths = simulate_gbm_paths(S, r, sigma, T=1.0, n_steps=252, n_paths=5000)
    fig = plot_mc_paths(paths, show=False)
    fig.write_html("examples/output_mc_paths.html")
    print(f"  ✓ examples/output_mc_paths.html")

    # VaR / CVaR
    terminal_returns = np.log(paths[:, -1] / paths[:, 0])
    var_result = compute_var_cvar(terminal_returns, confidence=0.95)
    print(f"\n年度风险 (95%置信):")
    print(f"  VaR:  {var_result['VaR']:.2%}")
    print(f"  CVaR: {var_result['CVaR']:.2%}")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 7. 量化因子
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("7. 量化因子 | Quantitative Factors")

    # 波动率体制
    vol_regime = volatility_regime(prices)
    print(f"当前波动率体制: {vol_regime['regime'].iloc[-1]}")
    print(f"  短期/长期Vol比: {vol_regime['vol_ratio'].iloc[-1]:.2f}")

    # RSI
    rsi_val = rsi(prices)
    print(f"RSI(14): {rsi_val.iloc[-1]:.1f}", end="")
    if rsi_val.iloc[-1] > 70:
        print(" → 超买⚠️")
    elif rsi_val.iloc[-1] < 30:
        print(" → 超卖⚠️")
    else:
        print(" → 中性")

    # Bollinger Bands
    bb = bollinger_bands(prices)
    print(f"Bollinger %B: {bb['pct_b'].iloc[-1]:.2f}")

    # MACD
    macd_data = macd(prices)
    print(f"MACD: {macd_data['macd'].iloc[-1]:.2f}, "
          f"Signal: {macd_data['signal'].iloc[-1]:.2f}, "
          f"Hist: {macd_data['histogram'].iloc[-1]:.2f}")

    # Skew分析
    otm_put_iv = sigma * 1.15   # 模拟OTM put IV偏高
    atm_iv = sigma
    otm_call_iv = sigma * 0.95  # 模拟OTM call IV偏低
    skew = skew_index(otm_put_iv, atm_iv, otm_call_iv)
    print(f"\n波动率偏度 (Skew):")
    print(f"  Put Skew:  {skew['put_skew']:.4f}")
    print(f"  Call Skew: {skew['call_skew']:.4f}")
    print(f"  比率: {skew['skew_ratio']:.2f}")

    # 期限结构
    slope = term_structure_slope(sigma * 1.1, sigma * 0.95)
    print(f"期限结构斜率: {slope:.4f} {'(反向←近期恐慌)' if slope < 0 else '(正向→正常)'}")

    # 模拟波动率微笑
    strikes_smile = np.linspace(K * 0.85, K * 1.15, 30)
    ivs_smile = sigma * (1 + 0.3 * ((strikes_smile - K) / K) ** 2 - 0.1 * (strikes_smile - K) / K)
    fig = plot_vol_smile(strikes_smile, ivs_smile, title="波动率微笑 | Volatility Smile", show=False)
    fig.write_html("examples/output_vol_smile.html")
    print(f"\n  ✓ examples/output_vol_smile.html")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8. 仓位管理与风险控制
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    separator("8. 仓位管理 | Position Sizing & Risk Management")

    capital = 100_000
    print(f"账户资金: ${capital:,.0f}")

    # Kelly
    k = kelly_fraction(0.55, avg_win=2.0, avg_loss=1.0)
    hk = half_kelly(0.55, avg_win=2.0, avg_loss=1.0)
    print(f"\nKelly比例: {k:.1%} → 半Kelly: {hk:.1%}")

    # Fixed fractional
    max_loss = abs(strategies["Iron Condor (铁鹰)"].max_loss(S_range))
    n_contracts = fixed_fractional_size(capital, 2.0, max_loss)
    print(f"固定比例法 (2%风险): 可交易 {n_contracts} 份铁鹰")

    # ATR止损
    stop = atr_stop(df["High"].values, df["Low"].values, df["Close"].values)
    print(f"\nATR(14): {stop['atr']:.2f}")
    print(f"多头止损: {stop['long_stop']:.2f}")
    print(f"空头止损: {stop['short_stop']:.2f}")

    # 风险回报比
    rr = risk_reward_ratio(S, stop["long_stop"], S * 1.05)
    print(f"风险回报比 (5%止盈): {rr:.2f}")

    # Greeks限额检查
    limits = RiskLimits(max_delta=500, max_gamma=50, max_vega=200)
    portfolio = strategies["Iron Condor (铁鹰)"].portfolio_greeks(S, T, r, sigma)
    # 模拟持有5份
    scaled = {k: v * 5 for k, v in portfolio.items()}
    print(f"\n持有5份铁鹰的风险检查:")
    print(limits.summary(scaled))

    # Gamma / Theta 信号
    print(f"\n{gamma_exposure_signal(scaled['gamma'])}")
    print(f"{theta_decay_warning(scaled['theta'], int(T * 365))}")

    # 交易时机建议
    print("\n📋 交易时机指南:")
    for scenario in ["sell_premium", "buy_premium", "earnings_play", "hedging"]:
        advice = get_timing_advice(scenario)
        print(f"\n  【{scenario}】")
        for k, v in advice.items():
            print(f"    {k}: {v}")

    separator("完成 | Done!")
    print("所有图表已保存至 examples/ 目录，用浏览器打开HTML文件即可交互查看。")
    print("建议: pip install jupyter 后在Notebook中运行，可实时交互。")


if __name__ == "__main__":
    use_live = "--live" in sys.argv
    main(use_live)
