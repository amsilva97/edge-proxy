"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Notifier from "@/components/notifier";
import NavSidebar from "@/components/navSidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
            <head>
                <title>Edge Proxy</title>
                <meta name="description" content="Edge proxy configuration manager" />
            </head>
            <body className="h-full flex bg-zinc-50 text-zinc-900 antialiased font-sans">
                <Notifier />
                <NavSidebar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </body>
        </html>
    );
}
