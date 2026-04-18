"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Settings, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

interface NavLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

const links: NavLink[] = [
    { label: "Proxies", href: "/proxies", icon: Network },
    { label: "App Config", href: "/app-config", icon: Settings },
];

export default function NavSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <nav className={`shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-200 ${collapsed ? "w-14" : "w-52"}`}>
            <div className="flex items-center h-14 border-b border-zinc-200 dark:border-zinc-800 px-2 overflow-hidden">
                <div className="flex items-center justify-center w-8 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-blue-500" aria-hidden="true">
                        <polygon points="10,2 18,6.5 18,13.5 10,18 2,13.5 2,6.5" stroke="currentColor" strokeWidth="1.75" />
                        <polygon points="10,6 14,8.5 14,13 10,15 6,13 6,8.5" fill="currentColor" opacity="0.45" />
                    </svg>
                </div>
                {!collapsed && (
                    <span className="font-semibold text-sm tracking-tight whitespace-nowrap ml-1">Edge Proxy</span>
                )}
            </div>

            <ul className="flex-1 py-3 px-2 space-y-0.5">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <li key={href} className="h-9">
                            <Link
                                href={href}
                                title={collapsed ? label : undefined}
                                className={`flex items-center h-full px-1 rounded-md text-sm transition-colors ${
                                    active
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                            >
                                <div className="flex items-center justify-center w-8 shrink-0">
                                    {Icon && <Icon size={15} strokeWidth={1.75} />}
                                </div>
                                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="px-2 pb-3">
                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="flex items-center justify-center w-full h-9 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {collapsed
                        ? <PanelLeftOpen size={15} strokeWidth={1.75} />
                        : <PanelLeftClose size={15} strokeWidth={1.75} />
                    }
                </button>
            </div>
        </nav>
    );
}
