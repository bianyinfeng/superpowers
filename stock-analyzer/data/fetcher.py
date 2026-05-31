"""
数据获取模块 - 使用akshare获取A股日线和周线数据
"""

import pandas as pd

try:
    import akshare as ak
except ImportError:
    ak = None


def _normalize_code(code: str) -> str:
    """标准化股票代码，去除后缀"""
    code = code.strip().upper()
    for suffix in (".SH", ".SZ", ".BJ"):
        if code.endswith(suffix):
            code = code[: -len(suffix)]
            break
    return code


def fetch_daily_data(code: str, days: int = 250) -> pd.DataFrame:
    """
    获取日线数据

    Parameters
    ----------
    code : str
        股票代码，如 '600519' 或 '600519.SH'
    days : int
        获取最近多少个交易日数据，默认250（约1年）

    Returns
    -------
    pd.DataFrame
        包含 date, open, high, low, close, volume 列的DataFrame
    """
    symbol = _normalize_code(code)

    if ak is None:
        raise ImportError(
            "akshare 未安装，请运行: pip install akshare"
        )

    df = ak.stock_zh_a_hist(
        symbol=symbol,
        period="daily",
        adjust="qfq",
    )

    # 标准化列名
    df = df.rename(columns={
        "日期": "date",
        "开盘": "open",
        "最高": "high",
        "最低": "low",
        "收盘": "close",
        "成交量": "volume",
        "成交额": "amount",
    })

    # 确保必要列存在
    required_cols = ["date", "open", "high", "low", "close", "volume"]
    for col in required_cols:
        if col not in df.columns:
            # 尝试英文列名（akshare不同版本列名可能不同）
            pass

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # 取最近N天
    if len(df) > days:
        df = df.tail(days).reset_index(drop=True)

    return df[required_cols + (["amount"] if "amount" in df.columns else [])]


def fetch_weekly_data(code: str, weeks: int = 120) -> pd.DataFrame:
    """
    获取周线数据

    Parameters
    ----------
    code : str
        股票代码
    weeks : int
        获取最近多少周数据，默认120（约2年多）

    Returns
    -------
    pd.DataFrame
        包含 date, open, high, low, close, volume 列的DataFrame
    """
    symbol = _normalize_code(code)

    if ak is None:
        raise ImportError(
            "akshare 未安装，请运行: pip install akshare"
        )

    df = ak.stock_zh_a_hist(
        symbol=symbol,
        period="weekly",
        adjust="qfq",
    )

    df = df.rename(columns={
        "日期": "date",
        "开盘": "open",
        "最高": "high",
        "最低": "low",
        "收盘": "close",
        "成交量": "volume",
        "成交额": "amount",
    })

    required_cols = ["date", "open", "high", "low", "close", "volume"]
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    if len(df) > weeks:
        df = df.tail(weeks).reset_index(drop=True)

    return df[required_cols + (["amount"] if "amount" in df.columns else [])]
