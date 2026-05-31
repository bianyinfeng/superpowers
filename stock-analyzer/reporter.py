"""
报告生成模块 - 输出分析结果
"""

from datetime import date

from strategies.base_strategy import StrategySignal


def generate_report(
    code: str,
    name: str,
    analysis_result: dict,
) -> str:
    """
    生成文本分析报告

    Parameters
    ----------
    code : str
        股票代码
    name : str
        股票名称
    analysis_result : dict
        analyzer.analyze() 的返回值

    Returns
    -------
    str
        格式化的分析报告文本
    """
    lines = []
    lines.append("")
    lines.append("=" * 50)
    lines.append("          股票量价分析报告")
    lines.append("=" * 50)
    lines.append(f"  股票: {code} {name}")
    lines.append(f"  分析日期: {date.today().isoformat()}")
    lines.append("━" * 50)
    lines.append("")

    # 日线分析
    daily = analysis_result.get("daily")
    if daily:
        lines.append("【日线级别分析】")
        lines.append(f"  当前趋势: {daily['trend']}")

        # MACD状态
        macd = daily["macd_signals"]
        macd_desc = f"  MACD状态: DIF={macd['dif']:.3f}, DEA={macd['dea']:.3f}"
        if macd["macd_bar"] > 0:
            bar_state = "红柱"
            if macd.get("bar_shrinking") == "red_expand":
                bar_state += "放大"
            elif macd.get("bar_shrinking") == "red_shrink":
                bar_state += "缩短"
        else:
            bar_state = "绿柱"
            if macd.get("bar_shrinking") == "green_expand":
                bar_state += "放大"
            elif macd.get("bar_shrinking") == "green_shrink":
                bar_state += "缩短"
        macd_desc += f", {bar_state}"
        lines.append(macd_desc)

        # 量能状态
        vol = daily["volume_signals"]
        lines.append(
            f"  量能状态: 量比{vol['volume_ratio']:.2f}, "
            f"{vol['volume_status']}"
        )

        # K线形态
        kline = daily["kline_signals"]
        if kline["bullish_patterns"]:
            lines.append(
                f"  看涨形态: {', '.join(kline['bullish_patterns'])}"
            )
        if kline["bearish_patterns"]:
            lines.append(
                f"  看跌形态: {', '.join(kline['bearish_patterns'])}"
            )

        lines.append("")

        # 策略命中
        signals = daily.get("triggered_strategies", [])
        if signals:
            lines.append("  策略命中:")
            for sig in signals:
                icon = "✅" if sig.direction == "buy" else "⚠️"
                lines.append(
                    f"  {icon} {sig.name}: 命中 "
                    f"(信心度: {sig.confidence:.0f}%)"
                )
                for reason in sig.reasons:
                    lines.append(f"     - {reason}")
                lines.append("")
        else:
            lines.append("  策略命中: 无策略触发")
            lines.append("")

    # 周线分析
    weekly = analysis_result.get("weekly")
    if weekly:
        lines.append("【周线级别分析】")
        lines.append(f"  当前趋势: {weekly['trend']}")

        macd_w = weekly["macd_signals"]
        lines.append(
            f"  MACD状态: DIF={macd_w['dif']:.3f}, DEA={macd_w['dea']:.3f}"
        )

        weekly_signals = weekly.get("triggered_strategies", [])
        if weekly_signals:
            lines.append("  周线策略命中:")
            for sig in weekly_signals:
                lines.append(
                    f"    ✅ {sig.name} (信心度: {sig.confidence:.0f}%)"
                )
        lines.append("")

    # 综合建议
    lines.append("━" * 50)
    rec = analysis_result.get("overall_recommendation", {})
    lines.append("【综合交易建议】")
    lines.append(f"  方向: {rec.get('direction', '观望')}")

    if rec.get("position_pct", 0) > 0:
        lines.append(f"  建议仓位: {rec['position_pct']}%")

    best = rec.get("best_signal")
    if best and best.entry_price:
        lines.append(f"  当前价格: ¥{best.entry_price:.2f}")
        if best.stop_profit:
            profit_pct = (best.stop_profit - best.entry_price) / best.entry_price * 100
            lines.append(
                f"  止盈价位: ¥{best.stop_profit:.2f} "
                f"(+{profit_pct:.1f}%)"
            )
        if best.stop_loss:
            loss_pct = (best.stop_loss - best.entry_price) / best.entry_price * 100
            lines.append(
                f"  止损价位: ¥{best.stop_loss:.2f} "
                f"({loss_pct:.1f}%)"
            )
        # 盈亏比
        if best.stop_profit and best.stop_loss:
            profit_range = best.stop_profit - best.entry_price
            loss_range = best.entry_price - best.stop_loss
            if loss_range > 0:
                ratio = profit_range / loss_range
                lines.append(f"  盈亏比: {ratio:.2f}:1")

    lines.append("")
    lines.append(f"  周线趋势配合: {rec.get('weekly_trend', '无数据')}")
    lines.append(
        f"  日线买入信号: {rec.get('buy_count', 0)}个, "
        f"卖出信号: {rec.get('sell_count', 0)}个"
    )

    lines.append("")
    lines.append("━" * 50)
    lines.append("⚠️  风险提示: 本分析仅供学习参考，不构成投资建议。")
    lines.append("    请严格执行止损纪律，控制单次风险在总资金2-5%。")
    lines.append("=" * 50)
    lines.append("")

    return "\n".join(lines)
