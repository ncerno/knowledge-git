import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarfieldBackground from "@/components/StarfieldBackground";
import PetalCanvas from "@/components/PetalCanvas";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "黑海岸·守望站 | Dark Shore",
  description: "守岸人的个人学习管理系统 — 以知识为灯塔，以星图为路径",
  keywords: ["学习管理", "知识库", "守岸人", "鸣潮"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="antialiased overflow-hidden h-screen">
        <StarfieldBackground />
        <PetalCanvas />
        <div
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)",
          }}
        />
        <main className="relative z-20 h-screen overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
