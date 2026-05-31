"""
MACD因子计算模块

基于Gerald Appel 1979年提出的MACD指标体系:
- DIF = EMA(12) - EMA(26)
- DEA = DIF的9日EMA
- MACD柱 = 2 × (DIF - DEA)

参考文献:
- Gerald Appel, Technical Analysis: Power Tools for Active Investors, 2005
"""

import numpy as np
import pandas as pd


def compute_macd(
    df: pd.DataFrame,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> pd.DataFrame:
    """
    计算MACD指标

    Parameters
    ----------
    df : pd.DataFrame
        必须包含 'close' 列
    fast : int
        快速EMA周期，默认12
    slow : int
        慢速EMA周期，默认26
    signal : int
        信号线EMA周期，默认9

    Returns
    -------
    pd.DataFrame
        原始DataFrame加上 dif, dea, macd_bar 列
    """
    result = df.copy()
    close = result["close"].astype(float)

    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()

    result["dif"] = ema_fast - ema_slow
    result["dea"] = result["dif"].ewm(span=signal, adjust=False).mean()
    result["macd_bar"] = 2 * (result["dif"] - result["dea"])

    return result


def detect_macd_signals(df: pd.DataFrame) -> dict:
    """
    检测MACD信号

    Parameters
    ----------
    df : pd.DataFrame
        必须包含 dif, dea, macd_bar, close 列（先调用compute_macd）

    Returns
    -------
    dict
        包含各种MACD信号的字典:
        - golden_cross: bool, 最近是否金叉
        - death_cross: bool, 最近是否死叉
        - golden_cross_above_zero: bool, 零轴上金叉
        - death_cross_below_zero: bool, 零轴下死叉
        - top_divergence: bool, 顶背离
        - bottom_divergence: bool, 底背离
        - bar_shrinking: str, 柱状体变化 ('red_shrink'/'green_shrink'/'expanding'/None)
        - dif: float, 当前DIF值
        - dea: float, 当前DEA值
        - macd_bar: float, 当前MACD柱值
        - above_zero: bool, DIF是否在零轴上方
    """
    if len(df) < 5:
        return _empty_signals()

    dif = df["dif"].values
    dea = df["dea"].values
    macd_bar = df["macd_bar"].values
    close = df["close"].values

    signals = {}

    # 当前值
    signals["dif"] = float(dif[-1])
    signals["dea"] = float(dea[-1])
    signals["macd_bar"] = float(macd_bar[-1])
    signals["above_zero"] = bool(dif[-1] > 0)

    # 金叉/死叉检测（最近3根K线内）
    signals["golden_cross"] = False
    signals["death_cross"] = False
    for i in range(-3, 0):
        if len(dif) + i > 0:
            prev_idx = len(dif) + i - 1
            curr_idx = len(dif) + i
            if prev_idx >= 0 and curr_idx < len(dif):
                if dif[prev_idx] <= dea[prev_idx] and dif[curr_idx] > dea[curr_idx]:
                    signals["golden_cross"] = True
                if dif[prev_idx] >= dea[prev_idx] and dif[curr_idx] < dea[curr_idx]:
                    signals["death_cross"] = True

    # 零轴上金叉 / 零轴下死叉
    signals["golden_cross_above_zero"] = (
        signals["golden_cross"] and dif[-1] > 0
    )
    signals["death_cross_below_zero"] = (
        signals["death_cross"] and dif[-1] < 0
    )

    # 背离检测
    signals["top_divergence"] = _detect_top_divergence(close, dif)
    signals["bottom_divergence"] = _detect_bottom_divergence(close, dif)

    # MACD柱变化
    signals["bar_shrinking"] = _detect_bar_change(macd_bar)

    return signals


def _detect_top_divergence(
    close: np.ndarray, dif: np.ndarray, lookback: int = 60
) -> bool:
    """
    顶背离：价格创新高，但DIF未创新高

    在最近lookback根K线内，寻找两个价格高点，
    如果后一个高点价格更高但DIF更低，则为顶背离。
    """
    if len(close) < lookback:
        lookback = len(close)
    if lookback < 20:
        return False

    recent_close = close[-lookback:]
    recent_dif = dif[-lookback:]

    # 找局部高点（至少间隔10根K线）
    highs = _find_peaks(recent_close, min_distance=10)

    if len(highs) < 2:
        return False

    # 取最近两个高点
    h1_idx, h2_idx = highs[-2], highs[-1]

    # 价格新高但DIF没有新高
    if recent_close[h2_idx] > recent_close[h1_idx] and recent_dif[h2_idx] < recent_dif[h1_idx]:
        return True

    return False


def _detect_bottom_divergence(
    close: np.ndarray, dif: np.ndarray, lookback: int = 60
) -> bool:
    """
    底背离：价格创新低，但DIF未创新低

    在最近lookback根K线内，寻找两个价格低点，
    如果后一个低点价格更低但DIF更高，则为底背离。
    """
    if len(close) < lookback:
        lookback = len(close)
    if lookback < 20:
        return False

    recent_close = close[-lookback:]
    recent_dif = dif[-lookback:]

    # 找局部低点
    lows = _find_troughs(recent_close, min_distance=10)

    if len(lows) < 2:
        return False

    l1_idx, l2_idx = lows[-2], lows[-1]

    # 价格新低但DIF没有新低
    if recent_close[l2_idx] < recent_close[l1_idx] and recent_dif[l2_idx] > recent_dif[l1_idx]:
        return True

    return False


def _find_peaks(data: np.ndarray, min_distance: int = 10) -> list:
    """寻找局部高点"""
    peaks = []
    for i in range(2, len(data) - 2):
        if data[i] > data[i - 1] and data[i] > data[i + 1]:
            if data[i] > data[i - 2] and data[i] > data[i + 2]:
                if not peaks or (i - peaks[-1]) >= min_distance:
                    peaks.append(i)
    return peaks


def _find_troughs(data: np.ndarray, min_distance: int = 10) -> list:
    """寻找局部低点"""
    troughs = []
    for i in range(2, len(data) - 2):
        if data[i] < data[i - 1] and data[i] < data[i + 1]:
            if data[i] < data[i - 2] and data[i] < data[i + 2]:
                if not troughs or (i - troughs[-1]) >= min_distance:
                    troughs.append(i)
    return troughs


def _detect_bar_change(macd_bar: np.ndarray) -> str | None:
    """检测MACD柱变化趋势"""
    if len(macd_bar) < 3:
        return None

    last3 = macd_bar[-3:]

    if last3[-1] > 0:
        # 红柱
        if abs(last3[-1]) < abs(last3[-2]):
            return "red_shrink"
        else:
            return "red_expand"
    elif last3[-1] < 0:
        # 绿柱
        if abs(last3[-1]) < abs(last3[-2]):
            return "green_shrink"
        else:
            return "green_expand"

    return None


def _empty_signals() -> dict:
    """返回空信号"""
    return {
        "dif": 0.0,
        "dea": 0.0,
        "macd_bar": 0.0,
        "above_zero": False,
        "golden_cross": False,
        "death_cross": False,
        "golden_cross_above_zero": False,
        "death_cross_below_zero": False,
        "top_divergence": False,
        "bottom_divergence": False,
        "bar_shrinking": None,
    }
