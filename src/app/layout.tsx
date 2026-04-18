"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Settings, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import "./globals.css";
import "./layout.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

interface NavLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

const links: NavLink[] = [
    { label: "Proxies", href: "/proxies", icon: Network },
    { label: "App Config", href: "/app-config", icon: Settings },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const navWidth = collapsed ? 56 : 150;

    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
            <head>
                <title>Edge Proxy</title>
                <meta name="description" content="Edge proxy configuration manager" />
            </head>
            <body className="layout-body">
                <nav className={`nav-sidebar ${collapsed ? "collapsed" : ""}`} style={{ width: `${navWidth}px` }}>
                    <div className="nav-sidebar-header">
                        <div className="nav-sidebar-icon-slot">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-blue-500" aria-hidden="true">
                                <polygon points="10,2 18,6.5 18,13.5 10,18 2,13.5 2,6.5" stroke="currentColor" strokeWidth="1.75" />
                                <polygon points="10,6 14,8.5 14,13 10,15 6,13 6,8.5" fill="currentColor" opacity="0.45" />
                            </svg>
                        </div>
                        {!collapsed && (
                            <span className="nav-sidebar-title">Edge Proxy</span>
                        )}
                    </div>

                    <ul className="nav-sidebar-list">
                        {links.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href || pathname.startsWith(href + "/");
                            return (
                                <li key={href} className="nav-sidebar-item">
                                    <Link
                                        href={href}
                                        title={collapsed ? label : undefined}
                                        className={`nav-link ${active ? "nav-link-active" : ""}`}
                                    >
                                        <div className="nav-sidebar-icon-slot">
                                            <Icon size={15} strokeWidth={1.75} />
                                        </div>
                                        {!collapsed && <span className="nav-label">{label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="nav-sidebar-footer">
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            className="nav-collapse-btn"
                        >
                            {collapsed
                                ? <PanelLeftOpen size={15} strokeWidth={1.75} />
                                : <PanelLeftClose size={15} strokeWidth={1.75} />
                            }
                        </button>
                    </div>
                </nav>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </body>
        </html>
    );
}
