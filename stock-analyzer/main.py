#!/usr/bin/env python3
"""
股票量价分析系统 - 主入口

基于K线形态、交易量能、MACD量价关系的A股分析系统。
支持日线和周线级别分析，输出交易建议、策略命中情况及止盈止损点位。

使用方法:
    python main.py 600519       # 分析贵州茅台
    python main.py 000001       # 分析平安银行
    python main.py 600519.SH    # 支持带后缀格式

依赖安装:
    pip install -r requirements.txt
"""

import sys
import os

# 确保模块可以正确导入
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.fetcher import fetch_daily_data, fetch_weekly_data
from analyzer import StockAnalyzer
from reporter import generate_report


def get_stock_name(code: str) -> str:
    """尝试获取股票名称"""
    try:
        import akshare as ak

        # 去除后缀
        symbol = code.strip().upper()
        for suffix in (".SH", ".SZ", ".BJ"):
            if symbol.endswith(suffix):
                symbol = symbol[: -len(suffix)]
                break

        # 尝试通过akshare获取股票信息
        df = ak.stock_individual_info_em(symbol=symbol)
        if df is not None and len(df) > 0:
            name_row = df[df["item"] == "股票简称"]
            if len(name_row) > 0:
                return str(name_row.iloc[0]["value"])
    except Exception:
        pass
    return ""


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python main.py <股票代码>")
        print("示例: python main.py 600519")
        print("      python main.py 000001")
        sys.exit(1)

    code = sys.argv[1]
    print(f"正在获取 {code} 的数据...")

    try:
        # 获取数据
        daily_df = fetch_daily_data(code, days=250)
        print(f"  日线数据: {len(daily_df)} 条")

        weekly_df = None
        try:
            weekly_df = fetch_weekly_data(code, weeks=120)
            print(f"  周线数据: {len(weekly_df)} 条")
        except Exception as e:
            print(f"  周线数据获取失败: {e}")

        # 获取股票名称
        stock_name = get_stock_name(code)

        # 分析
        print("正在分析...")
        analyzer = StockAnalyzer()
        result = analyzer.analyze(daily_df, weekly_df)

        # 输出报告
        report = generate_report(code, stock_name, result)
        print(report)

    except ImportError as e:
        print(f"错误: {e}")
        print("请先安装依赖: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"分析失败: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
