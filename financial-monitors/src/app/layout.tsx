import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "金融市场监测仪表盘",
  description: "美债、美元、黄金、通胀研究模型监测系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
