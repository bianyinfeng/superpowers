"""
量能因子计算模块

基于Joseph Granville量价分析理论:
- 量比: 当日成交量与近期均量的比值
- 量价配合: 价涨量增/价跌量缩为健康
- OBV能量潮: 累计资金流向指标

参考文献:
- Joseph Granville, Granville's New Key to Stock Market Profits, 1963
"""

import numpy as np
import pandas as pd


def compute_volume_factors(df: pd.DataFrame) -> dict:
    """
    计算量能因子

    Parameters
    ----------
    df : pd.DataFrame
        必须包含 close, volume 列

    Returns
    -------
    dict
        包含各种量能信号:
        - volume_ratio: float, 量比（当日量/5日均量）
        - volume_status: str, 量能状态描述
        - volume_price_harmony: bool, 量价是否配合
        - volume_price_divergence: bool, 量价是否背离
        - extreme_low_volume: bool, 是否地量
        - extreme_high_volume: bool, 是否天量
        - consecutive_shrink: int, 连续缩量天数
        - obv_trend: str, OBV趋势方向
        - ma5_volume: float, 5日均量
        - ma20_volume: float, 20日均量
        - ma60_volume: float, 60日均量
    """
    if len(df) < 10:
        return _empty_volume_signals()

    close = df["close"].values.astype(float)
    volume = df["volume"].values.astype(float)

    signals = {}

    # 均量计算
    ma5_vol = np.mean(volume[-6:-1]) if len(volume) > 5 else volume[-1]
    ma20_vol = np.mean(volume[-21:-1]) if len(volume) > 20 else ma5_vol
    ma60_vol = np.mean(volume[-61:-1]) if len(volume) > 60 else ma20_vol

    signals["ma5_volume"] = float(ma5_vol)
    signals["ma20_volume"] = float(ma20_vol)
    signals["ma60_volume"] = float(ma60_vol)

    # 量比
    current_vol = volume[-1]
    signals["volume_ratio"] = float(current_vol / ma5_vol) if ma5_vol > 0 else 1.0

    # 量能状态描述
    vr = signals["volume_ratio"]
    if vr > 3.0:
        signals["volume_status"] = "巨量放大"
    elif vr > 2.0:
        signals["volume_status"] = "明显放量"
    elif vr > 1.5:
        signals["volume_status"] = "温和放量"
    elif vr > 0.8:
        signals["volume_status"] = "量能平稳"
    elif vr > 0.5:
        signals["volume_status"] = "轻度缩量"
    else:
        signals["volume_status"] = "明显缩量"

    # 量价配合度
    signals["volume_price_harmony"] = _check_volume_price_harmony(close, volume)

    # 量价背离（价格创近期新高但量未新高）
    signals["volume_price_divergence"] = _check_volume_price_divergence(
        close, volume
    )

    # 地量信号（成交量 < 60日均量 × 0.3）
    signals["extreme_low_volume"] = bool(current_vol < ma60_vol * 0.3)

    # 天量信号（成交量 > 60日均量 × 3）
    signals["extreme_high_volume"] = bool(current_vol > ma60_vol * 3)

    # 近5日内是否出现地量/天量
    signals["recent_extreme_low"] = bool(
        any(v < ma60_vol * 0.4 for v in volume[-5:])
    )
    signals["recent_extreme_high"] = bool(
        any(v > ma60_vol * 3 for v in volume[-5:])
    )

    # 连续缩量天数
    signals["consecutive_shrink"] = _count_consecutive_shrink(volume)

    # OBV能量潮趋势
    signals["obv_trend"] = _compute_obv_trend(close, volume)

    return signals


def _check_volume_price_harmony(close: np.ndarray, volume: np.ndarray) -> bool:
    """
    检查量价配合:
    - 价涨量增 = 健康上涨
    - 价跌量缩 = 健康回调
    """
    if len(close) < 5:
        return False

    # 检查最近3天
    harmony_count = 0
    for i in range(-3, 0):
        price_up = close[i] > close[i - 1]
        vol_up = volume[i] > volume[i - 1]

        if (price_up and vol_up) or (not price_up and not vol_up):
            harmony_count += 1

    return harmony_count >= 2


def _check_volume_price_divergence(
    close: np.ndarray, volume: np.ndarray
) -> bool:
    """
    量价背离: 价格创20日新高但成交量未创20日新高
    """
    if len(close) < 20:
        return False

    recent_20_close = close[-20:]
    recent_20_vol = volume[-20:]

    # 当前价格是否为近20日最高
    price_at_high = close[-1] >= np.max(recent_20_close[:-1])

    # 当前成交量是否为近20日最高
    vol_at_high = volume[-1] >= np.max(recent_20_vol[:-1])

    return price_at_high and not vol_at_high


def _count_consecutive_shrink(volume: np.ndarray) -> int:
    """计算连续缩量天数"""
    count = 0
    for i in range(len(volume) - 1, 0, -1):
        if volume[i] < volume[i - 1]:
            count += 1
        else:
            break
    return count


def _compute_obv_trend(close: np.ndarray, volume: np.ndarray) -> str:
    """
    计算OBV能量潮趋势

    OBV = 累计(涨日成交量 - 跌日成交量)
    判断最近10日OBV是上升还是下降趋势
    """
    if len(close) < 11:
        return "neutral"

    obv = np.zeros(len(close))
    for i in range(1, len(close)):
        if close[i] > close[i - 1]:
            obv[i] = obv[i - 1] + volume[i]
        elif close[i] < close[i - 1]:
            obv[i] = obv[i - 1] - volume[i]
        else:
            obv[i] = obv[i - 1]

    # 判断最近10日OBV趋势
    recent_obv = obv[-10:]
    slope = np.polyfit(range(len(recent_obv)), recent_obv, 1)[0]

    if slope > 0:
        return "rising"
    elif slope < 0:
        return "falling"
    return "neutral"


def _empty_volume_signals() -> dict:
    """返回空信号"""
    return {
        "volume_ratio": 1.0,
        "volume_status": "数据不足",
        "volume_price_harmony": False,
        "volume_price_divergence": False,
        "extreme_low_volume": False,
        "extreme_high_volume": False,
        "recent_extreme_low": False,
        "recent_extreme_high": False,
        "consecutive_shrink": 0,
        "obv_trend": "neutral",
        "ma5_volume": 0.0,
        "ma20_volume": 0.0,
        "ma60_volume": 0.0,
    }
