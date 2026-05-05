import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
            <head>
                <title>Edge Proxy</title>
                <meta name="description" content="Edge proxy configuration manager" />
            </head>
            <body className="h-full bg-zinc-50 text-zinc-900 antialiased font-sans">
                {children}
            </body>
        </html>
    );
}
