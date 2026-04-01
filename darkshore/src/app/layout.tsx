import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import StarfieldBackground from "@/components/StarfieldBackground";
import PetalCanvas from "@/components/PetalCanvas";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans-rounded",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
  display: "swap",
  weight: ["400", "500", "600"],
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
    <html lang="zh-CN" className={`${nunito.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        <StarfieldBackground />
        <PetalCanvas />
        <div
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.006) 2px, rgba(0,229,255,0.006) 4px)",
          }}
        />
        <main className="relative z-20 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
