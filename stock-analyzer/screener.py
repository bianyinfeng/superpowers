"""
批量选股模块 - 对全市场股票进行策略评分和排序

功能:
1. 获取全部A股代码列表
2. 逐一下载日线数据并计算因子
3. 对每只股票的策略命中情况进行量化评分
4. 按综合得分排序输出选股报告

评分体系:
- 策略命中得分: 每个命中策略的信心度累加
- 趋势加分: 上升趋势 +10, 横盘 0, 下降 -10
- 量价配合加分: 量价配合 +5
- 周线共振加分: 周线策略命中 +15
- 卖出信号扣分: 每个卖出信号 -20
"""

import time
import traceback
from dataclasses import dataclass, field
from datetime import date

import pandas as pd

from analyzer import StockAnalyzer
from data.fetcher import fetch_daily_data, fetch_all_stock_codes
from strategies.base_strategy import StrategySignal


@dataclass
class StockScore:
    """单只股票的评分结果"""

    code: str
    name: str
    score: float  # 综合得分
    direction: str  # 'buy' / 'sell' / 'hold'
    triggered_strategies: list[str] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)
    confidence_max: float = 0.0  # 最高策略信心度
    current_price: float = 0.0
    stop_profit: float | None = None
    stop_loss: float | None = None
    trend: str = ""
    volume_status: str = ""
    error: str | None = None


class BatchScreener:
    """批量选股引擎"""

    def __init__(self, top_n: int = 50, delay: float = 0.5):
        """
        Parameters
        ----------
        top_n : int
            输出前N只得分最高的股票
        delay : float
            每只股票请求间隔（秒），避免被封IP
        """
        self.top_n = top_n
        self.delay = delay
        self.analyzer = StockAnalyzer()

    def screen_all(
        self,
        stock_list: pd.DataFrame | None = None,
        progress_callback=None,
    ) -> list[StockScore]:
        """
        对全市场股票进行筛选评分

        Parameters
        ----------
        stock_list : pd.DataFrame | None
            股票列表(code, name)，为None则自动获取全部A股
        progress_callback : callable | None
            进度回调函数 callback(current, total, code, name)

        Returns
        -------
        list[StockScore]
            按得分降序排列的评分结果列表
        """
        if stock_list is None:
            print("正在获取全部A股代码列表...")
            stock_list = fetch_all_stock_codes()
            print(f"共获取 {len(stock_list)} 只股票")

        results = []
        total = len(stock_list)

        for idx, row in stock_list.iterrows():
            code = row["code"]
            name = row["name"]

            if progress_callback:
                progress_callback(idx + 1, total, code, name)
            else:
                if (idx + 1) % 50 == 0 or idx == 0:
                    print(f"  进度: {idx + 1}/{total} - {code} {name}")

            score = self._score_stock(code, name)
            if score is not None and score.error is None:
                results.append(score)

            # 请求间隔
            if self.delay > 0:
                time.sleep(self.delay)

        # 按得分降序排列
        results.sort(key=lambda x: x.score, reverse=True)

        return results

    def screen_codes(self, codes: list[str]) -> list[StockScore]:
        """
        对指定股票列表进行筛选评分

        Parameters
        ----------
        codes : list[str]
            股票代码列表

        Returns
        -------
        list[StockScore]
            按得分降序排列的评分结果列表
        """
        stock_list = pd.DataFrame({
            "code": codes,
            "name": [""] * len(codes),
        })
        return self.screen_all(stock_list)

    def _score_stock(self, code: str, name: str) -> StockScore | None:
        """对单只股票进行评分"""
        try:
            # 获取日线数据
            daily_df = fetch_daily_data(code, days=120)

            if len(daily_df) < 30:
                return StockScore(
                    code=code, name=name, score=0, direction="hold",
                    error="数据不足"
                )

            # 分析
            result = self.analyzer.analyze(daily_df, None)
            daily = result.get("daily", {})

            # 计算得分
            score = self._compute_score(daily)

            # 获取最佳信号
            signals = daily.get("triggered_strategies", [])
            buy_signals = [s for s in signals if s.direction == "buy"]
            sell_signals = [s for s in signals if s.direction == "sell"]

            if sell_signals:
                direction = "sell"
                best = max(sell_signals, key=lambda s: s.confidence)
            elif buy_signals:
                direction = "buy"
                best = max(buy_signals, key=lambda s: s.confidence)
            else:
                direction = "hold"
                best = None

            return StockScore(
                code=code,
                name=name,
                score=score,
                direction=direction,
                triggered_strategies=[s.name for s in signals],
                reasons=best.reasons if best else [],
                confidence_max=best.confidence if best else 0,
                current_price=daily.get("current_price", 0),
                stop_profit=best.stop_profit if best else None,
                stop_loss=best.stop_loss if best else None,
                trend=daily.get("trend", ""),
                volume_status=daily.get("volume_signals", {}).get(
                    "volume_status", ""
                ),
            )

        except Exception as e:
            return StockScore(
                code=code, name=name, score=0, direction="hold",
                error=str(e)
            )

    def _compute_score(self, daily_result: dict) -> float:
        """
        计算综合评分

        评分规则:
        - 每个买入策略命中: +策略信心度 (0-95)
        - 每个卖出策略命中: -策略信心度
        - 趋势加分: 上升+10, 横盘0, 下降-10
        - 量价配合: +5
        - OBV上升: +5
        - MACD零轴上方: +5
        - MACD红柱放大: +5
        """
        score = 0.0

        # 策略命中得分
        signals = daily_result.get("triggered_strategies", [])
        for sig in signals:
            if sig.direction == "buy":
                score += sig.confidence
            elif sig.direction == "sell":
                score -= sig.confidence

        # 趋势加分
        trend = daily_result.get("trend", "")
        if trend == "上升趋势":
            score += 10
        elif trend == "下降趋势":
            score -= 10

        # 量能加分
        vol_signals = daily_result.get("volume_signals", {})
        if vol_signals.get("volume_price_harmony"):
            score += 5
        if vol_signals.get("obv_trend") == "rising":
            score += 5

        # MACD加分
        macd_signals = daily_result.get("macd_signals", {})
        if macd_signals.get("above_zero"):
            score += 5
        if macd_signals.get("bar_shrinking") in ("red_expand",):
            score += 5
        if macd_signals.get("golden_cross"):
            score += 10

        # K线形态加分
        kline_signals = daily_result.get("kline_signals", {})
        if kline_signals.get("has_bullish_signal"):
            score += 5
        if kline_signals.get("has_bearish_signal"):
            score -= 5

        return score


def generate_screening_report(
    results: list[StockScore],
    top_n: int = 50,
) -> str:
    """
    生成选股报告

    Parameters
    ----------
    results : list[StockScore]
        评分结果列表（已排序）
    top_n : int
        输出前N只

    Returns
    -------
    str
        格式化的选股报告文本
    """
    lines = []
    lines.append("")
    lines.append("=" * 70)
    lines.append("              A股量价选股报告")
    lines.append("=" * 70)
    lines.append(f"  生成日期: {date.today().isoformat()}")
    lines.append(f"  扫描股票数: {len(results)}")

    # 统计
    buy_count = sum(1 for r in results if r.direction == "buy")
    sell_count = sum(1 for r in results if r.direction == "sell")
    lines.append(f"  买入信号股票: {buy_count} 只")
    lines.append(f"  卖出信号股票: {sell_count} 只")
    lines.append("━" * 70)
    lines.append("")

    # 买入推荐（得分最高的）
    buy_results = [r for r in results if r.direction == "buy" and r.score > 0]
    top_buy = buy_results[:top_n]

    if top_buy:
        lines.append(f"【买入推荐 TOP {min(top_n, len(top_buy))}】")
        lines.append("")
        lines.append(
            f"{'排名':<4} {'代码':<8} {'名称':<8} {'得分':<7} "
            f"{'信心度':<7} {'趋势':<8} {'量能':<8} {'命中策略'}"
        )
        lines.append("-" * 70)

        for i, r in enumerate(top_buy, 1):
            strategies_str = ", ".join(r.triggered_strategies) if r.triggered_strategies else "-"
            lines.append(
                f"{i:<4} {r.code:<8} {r.name:<8} {r.score:<7.1f} "
                f"{r.confidence_max:<7.0f} {r.trend:<8} "
                f"{r.volume_status:<8} {strategies_str}"
            )

        lines.append("")

        # 详细信息（前10只）
        lines.append("【详细分析 - 前10只】")
        lines.append("")
        for i, r in enumerate(top_buy[:10], 1):
            lines.append(f"  {i}. {r.code} {r.name}")
            lines.append(f"     综合得分: {r.score:.1f} | 当前价: ¥{r.current_price:.2f}")
            lines.append(f"     趋势: {r.trend} | 量能: {r.volume_status}")
            if r.triggered_strategies:
                lines.append(f"     命中策略: {', '.join(r.triggered_strategies)}")
            if r.reasons:
                lines.append(f"     触发原因: {'; '.join(r.reasons[:3])}")
            if r.stop_profit:
                profit_pct = (r.stop_profit - r.current_price) / r.current_price * 100
                lines.append(f"     止盈: ¥{r.stop_profit:.2f} (+{profit_pct:.1f}%)")
            if r.stop_loss:
                loss_pct = (r.stop_loss - r.current_price) / r.current_price * 100
                lines.append(f"     止损: ¥{r.stop_loss:.2f} ({loss_pct:.1f}%)")
            if r.stop_profit and r.stop_loss and r.current_price:
                profit_range = r.stop_profit - r.current_price
                loss_range = r.current_price - r.stop_loss
                if loss_range > 0:
                    lines.append(f"     盈亏比: {profit_range / loss_range:.2f}:1")
            lines.append("")

    else:
        lines.append("【买入推荐】")
        lines.append("  今日无买入信号触发")
        lines.append("")

    # 卖出预警
    sell_results = [r for r in results if r.direction == "sell"]
    if sell_results:
        lines.append("━" * 70)
        lines.append("【卖出预警】")
        lines.append("")
        for r in sell_results[:20]:
            lines.append(
                f"  ⚠️  {r.code} {r.name} | "
                f"得分: {r.score:.1f} | "
                f"策略: {', '.join(r.triggered_strategies)}"
            )
        lines.append("")

    lines.append("━" * 70)
    lines.append("⚠️  风险提示: 本报告仅供学习参考，不构成投资建议。")
    lines.append("    请严格执行止损纪律，控制单次风险在总资金2-5%。")
    lines.append("=" * 70)
    lines.append("")

    return "\n".join(lines)
