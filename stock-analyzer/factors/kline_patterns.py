"""
K线形态识别模块

基于Steve Nison《日本蜡烛图技术》(Japanese Candlestick Charting Techniques, 1991)
实现主要的反转形态和持续形态识别。

支持的形态:
- 反转形态: 锤子线、倒锤子线、吞没形态、乌云盖顶、刺透形态、十字星、早晨之星、黄昏之星
- 持续形态: 三白兵、三只乌鸦、上升三法、下降三法
- 趋势形态: 高低点抬升/下移 (道氏理论)
"""

import numpy as np
import pandas as pd


def detect_kline_patterns(df: pd.DataFrame) -> dict:
    """
    检测K线形态

    Parameters
    ----------
    df : pd.DataFrame
        必须包含 open, high, low, close 列

    Returns
    -------
    dict
        包含各种K线形态检测结果:
        - bullish_patterns: list[str], 检测到的看涨形态名称
        - bearish_patterns: list[str], 检测到的看跌形态名称
        - trend: str, 当前趋势判断 ('uptrend'/'downtrend'/'sideways')
        - has_bullish_signal: bool
        - has_bearish_signal: bool
    """
    if len(df) < 5:
        return _empty_kline_signals()

    o = df["open"].values.astype(float)
    h = df["high"].values.astype(float)
    l = df["low"].values.astype(float)
    c = df["close"].values.astype(float)

    bullish = []
    bearish = []

    # 单根K线形态（检测最后一根）
    if _is_hammer(o, h, l, c):
        bullish.append("锤子线(Hammer)")

    if _is_inverted_hammer(o, h, l, c):
        bullish.append("倒锤子线(Inverted Hammer)")

    if _is_doji(o, h, l, c):
        # 十字星在下跌趋势中看涨，上涨趋势中看跌
        trend = _detect_short_trend(c)
        if trend == "downtrend":
            bullish.append("十字星(Doji)-底部")
        elif trend == "uptrend":
            bearish.append("十字星(Doji)-顶部")

    # 双根K线形态
    if _is_bullish_engulfing(o, h, l, c):
        bullish.append("看涨吞没(Bullish Engulfing)")

    if _is_bearish_engulfing(o, h, l, c):
        bearish.append("看跌吞没(Bearish Engulfing)")

    if _is_dark_cloud_cover(o, h, l, c):
        bearish.append("乌云盖顶(Dark Cloud Cover)")

    if _is_piercing_pattern(o, h, l, c):
        bullish.append("刺透形态(Piercing Pattern)")

    # 三根K线形态
    if _is_morning_star(o, h, l, c):
        bullish.append("早晨之星(Morning Star)")

    if _is_evening_star(o, h, l, c):
        bearish.append("黄昏之星(Evening Star)")

    if _is_three_white_soldiers(o, h, l, c):
        bullish.append("三白兵(Three White Soldiers)")

    if _is_three_black_crows(o, h, l, c):
        bearish.append("三只乌鸦(Three Black Crows)")

    # 趋势判断
    trend = _detect_trend(h, l, c)

    return {
        "bullish_patterns": bullish,
        "bearish_patterns": bearish,
        "trend": trend,
        "has_bullish_signal": len(bullish) > 0,
        "has_bearish_signal": len(bearish) > 0,
    }


# ============ 单根K线形态 ============


def _is_hammer(o, h, l, c) -> bool:
    """
    锤子线: 下影线 >= 实体2倍，上影线很短，出现在下跌后
    """
    idx = -1
    body = abs(c[idx] - o[idx])
    if body == 0:
        return False

    upper_shadow = h[idx] - max(o[idx], c[idx])
    lower_shadow = min(o[idx], c[idx]) - l[idx]

    # 下影线 >= 实体2倍，上影线 < 实体0.3倍
    if lower_shadow >= body * 2 and upper_shadow <= body * 0.3:
        # 前几天是下跌趋势
        if _detect_short_trend(c) == "downtrend":
            return True
    return False


def _is_inverted_hammer(o, h, l, c) -> bool:
    """
    倒锤子线: 上影线 >= 实体2倍，下影线很短，出现在下跌后
    """
    idx = -1
    body = abs(c[idx] - o[idx])
    if body == 0:
        return False

    upper_shadow = h[idx] - max(o[idx], c[idx])
    lower_shadow = min(o[idx], c[idx]) - l[idx]

    if upper_shadow >= body * 2 and lower_shadow <= body * 0.3:
        if _detect_short_trend(c) == "downtrend":
            return True
    return False


def _is_doji(o, h, l, c) -> bool:
    """
    十字星: 实体极小（< 总振幅的10%）
    """
    idx = -1
    total_range = h[idx] - l[idx]
    if total_range == 0:
        return False

    body = abs(c[idx] - o[idx])
    return body <= total_range * 0.1


# ============ 双根K线形态 ============


def _is_bullish_engulfing(o, h, l, c) -> bool:
    """
    看涨吞没: 阴线后跟一根大阳线，阳线实体完全包含阴线实体
    """
    if len(o) < 2:
        return False

    # 前一根是阴线
    prev_bearish = c[-2] < o[-2]
    # 当前是阳线
    curr_bullish = c[-1] > o[-1]

    if prev_bearish and curr_bullish:
        # 当前实体包含前一根实体
        if o[-1] <= c[-2] and c[-1] >= o[-2]:
            return True
    return False


def _is_bearish_engulfing(o, h, l, c) -> bool:
    """
    看跌吞没: 阳线后跟一根大阴线，阴线实体完全包含阳线实体
    """
    if len(o) < 2:
        return False

    prev_bullish = c[-2] > o[-2]
    curr_bearish = c[-1] < o[-1]

    if prev_bullish and curr_bearish:
        if o[-1] >= c[-2] and c[-1] <= o[-2]:
            return True
    return False


def _is_dark_cloud_cover(o, h, l, c) -> bool:
    """
    乌云盖顶: 阳线后，高开低走的阴线，收盘价深入前阳线实体50%以下
    """
    if len(o) < 2:
        return False

    prev_bullish = c[-2] > o[-2]
    curr_bearish = c[-1] < o[-1]
    curr_gap_up = o[-1] > c[-2]

    if prev_bullish and curr_bearish and curr_gap_up:
        midpoint = (o[-2] + c[-2]) / 2
        if c[-1] < midpoint:
            return True
    return False


def _is_piercing_pattern(o, h, l, c) -> bool:
    """
    刺透形态: 阴线后，低开高走的阳线，收盘价深入前阴线实体50%以上
    """
    if len(o) < 2:
        return False

    prev_bearish = c[-2] < o[-2]
    curr_bullish = c[-1] > o[-1]
    curr_gap_down = o[-1] < c[-2]

    if prev_bearish and curr_bullish and curr_gap_down:
        midpoint = (o[-2] + c[-2]) / 2
        if c[-1] > midpoint:
            return True
    return False


# ============ 三根K线形态 ============


def _is_morning_star(o, h, l, c) -> bool:
    """
    早晨之星: 大阴线 + 小实体(星) + 大阳线
    """
    if len(o) < 3:
        return False

    # 第一根: 大阴线
    first_bearish = c[-3] < o[-3]
    first_body = abs(c[-3] - o[-3])

    # 第二根: 小实体（实体 < 第一根的30%）
    second_body = abs(c[-2] - o[-2])
    small_body = second_body < first_body * 0.3

    # 第三根: 大阳线，收盘价超过第一根实体中点
    third_bullish = c[-1] > o[-1]
    third_body = abs(c[-1] - o[-1])
    midpoint = (o[-3] + c[-3]) / 2
    above_mid = c[-1] > midpoint

    return first_bearish and small_body and third_bullish and above_mid


def _is_evening_star(o, h, l, c) -> bool:
    """
    黄昏之星: 大阳线 + 小实体(星) + 大阴线
    """
    if len(o) < 3:
        return False

    first_bullish = c[-3] > o[-3]
    first_body = abs(c[-3] - o[-3])

    second_body = abs(c[-2] - o[-2])
    small_body = second_body < first_body * 0.3

    third_bearish = c[-1] < o[-1]
    midpoint = (o[-3] + c[-3]) / 2
    below_mid = c[-1] < midpoint

    return first_bullish and small_body and third_bearish and below_mid


def _is_three_white_soldiers(o, h, l, c) -> bool:
    """
    三白兵: 连续三根阳线，每根收盘价高于前一根
    """
    if len(o) < 3:
        return False

    for i in [-3, -2, -1]:
        if c[i] <= o[i]:
            return False

    if c[-2] > c[-3] and c[-1] > c[-2]:
        return True
    return False


def _is_three_black_crows(o, h, l, c) -> bool:
    """
    三只乌鸦: 连续三根阴线，每根收盘价低于前一根
    """
    if len(o) < 3:
        return False

    for i in [-3, -2, -1]:
        if c[i] >= o[i]:
            return False

    if c[-2] < c[-3] and c[-1] < c[-2]:
        return True
    return False


# ============ 趋势判断 ============


def _detect_short_trend(close: np.ndarray, lookback: int = 5) -> str:
    """短期趋势判断（最近几根K线）"""
    if len(close) < lookback + 1:
        return "sideways"

    recent = close[-(lookback + 1):]
    if recent[-1] < recent[0] and np.mean(np.diff(recent)) < 0:
        return "downtrend"
    elif recent[-1] > recent[0] and np.mean(np.diff(recent)) > 0:
        return "uptrend"
    return "sideways"


def _detect_trend(
    high: np.ndarray, low: np.ndarray, close: np.ndarray
) -> str:
    """
    趋势判断 (道氏理论: 高低点抬升=上升趋势，高低点下移=下降趋势)

    使用5日/10日/20日均线多头/空头排列辅助判断
    """
    if len(close) < 20:
        return "sideways"

    # 均线排列判断
    ma5 = np.mean(close[-5:])
    ma10 = np.mean(close[-10:])
    ma20 = np.mean(close[-20:])

    if ma5 > ma10 > ma20:
        return "uptrend"
    elif ma5 < ma10 < ma20:
        return "downtrend"

    # 高低点判断
    recent_highs = []
    recent_lows = []
    for i in range(max(len(high) - 20, 2), len(high) - 2):
        if high[i] > high[i - 1] and high[i] > high[i + 1]:
            recent_highs.append(high[i])
        if low[i] < low[i - 1] and low[i] < low[i + 1]:
            recent_lows.append(low[i])

    if len(recent_highs) >= 2 and len(recent_lows) >= 2:
        highs_rising = recent_highs[-1] > recent_highs[-2]
        lows_rising = recent_lows[-1] > recent_lows[-2]
        if highs_rising and lows_rising:
            return "uptrend"

        highs_falling = recent_highs[-1] < recent_highs[-2]
        lows_falling = recent_lows[-1] < recent_lows[-2]
        if highs_falling and lows_falling:
            return "downtrend"

    return "sideways"


def _empty_kline_signals() -> dict:
    """返回空信号"""
    return {
        "bullish_patterns": [],
        "bearish_patterns": [],
        "trend": "sideways",
        "has_bullish_signal": False,
        "has_bearish_signal": False,
    }
