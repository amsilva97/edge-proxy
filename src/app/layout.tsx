import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Edge Proxy",
    description: "Edge proxy configuration manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
            <body className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans">

                <header className="shrink-0 h-14 flex items-center gap-2.5 px-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-blue-500" aria-hidden="true">
                        <polygon points="10,2 18,6.5 18,13.5 10,18 2,13.5 2,6.5" stroke="currentColor" strokeWidth="1.75" />
                        <polygon points="10,6 14,8.5 14,13 10,15 6,13 6,8.5" fill="currentColor" opacity="0.45" />
                    </svg>
                    <span className="font-semibold text-sm tracking-tight">Edge Proxy</span>
                </header>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>

            </body>
        </html>
    );
}
