#!/usr/bin/env python3
"""
批量选股入口 - A股全市场量价选股

使用方法:
    python run_screener.py                # 扫描全部A股
    python run_screener.py --top 30       # 输出前30只
    python run_screener.py --codes 600519,000001,300750  # 只扫描指定股票
    python run_screener.py --save         # 保存报告到文件
    python run_screener.py --delay 1.0    # 设置请求间隔（秒）

依赖安装:
    pip install -r requirements.txt
"""

import sys
import os
import argparse
from datetime import date

# 确保模块可以正确导入
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from screener import BatchScreener, generate_screening_report


def main():
    parser = argparse.ArgumentParser(
        description="A股量价批量选股系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python run_screener.py                        # 全市场扫描
  python run_screener.py --top 20               # 输出前20只
  python run_screener.py --codes 600519,000001  # 指定股票
  python run_screener.py --save                 # 保存到文件
        """,
    )

    parser.add_argument(
        "--top", type=int, default=50,
        help="输出得分最高的前N只股票 (默认: 50)",
    )
    parser.add_argument(
        "--codes", type=str, default=None,
        help="指定股票代码列表(逗号分隔)，不指定则扫描全市场",
    )
    parser.add_argument(
        "--delay", type=float, default=0.3,
        help="每只股票请求间隔秒数 (默认: 0.3)",
    )
    parser.add_argument(
        "--save", action="store_true",
        help="保存报告到文件",
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help="输出文件路径 (默认: screening_report_YYYY-MM-DD.txt)",
    )

    args = parser.parse_args()

    try:
        screener = BatchScreener(top_n=args.top, delay=args.delay)

        if args.codes:
            # 指定股票
            codes = [c.strip() for c in args.codes.split(",")]
            print(f"扫描指定股票: {codes}")
            results = screener.screen_codes(codes)
        else:
            # 全市场扫描
            print("=" * 50)
            print("  A股全市场量价选股")
            print("=" * 50)
            print()
            print("⚠️  全市场扫描需要较长时间（约5000只股票）")
            print(f"   请求间隔: {args.delay}秒")
            print(f"   预计耗时: {5000 * args.delay / 60:.0f} 分钟")
            print()
            results = screener.screen_all()

        # 生成报告
        report = generate_screening_report(results, top_n=args.top)
        print(report)

        # 保存到文件
        if args.save:
            if args.output:
                filepath = args.output
            else:
                filepath = f"screening_report_{date.today().isoformat()}.txt"

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(report)
            print(f"\n报告已保存到: {filepath}")

    except ImportError as e:
        print(f"错误: {e}")
        print("请先安装依赖: pip install -r requirements.txt")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n用户中断，正在输出已扫描结果...")
        if "results" in dir() and results:
            report = generate_screening_report(results, top_n=args.top)
            print(report)
    except Exception as e:
        print(f"选股失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
