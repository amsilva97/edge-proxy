"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Settings, ShieldCheck, Scissors, ArrowRightLeft, Users, Server, Layers, CornerDownRight, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

interface NavLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

const links: NavLink[] = [
    { label: "Http Hosts",    href: "/http-hosts",    icon: Network          },
    { label: "Http Proxies",  href: "/http-proxies",      icon: ArrowRightLeft   },
    { label: "Http Load Balancers", href: "/http-loadbalancer", icon: Layers           },
    { label: "Http Redirects",   href: "/http-redirects",   icon: CornerDownRight  },
    { label: "Snippets",      href: "/snippets",      icon: Scissors         },
    { label: "SSLs",          href: "/ssls",          icon: ShieldCheck      },
    { label: "Roles",         href: "/roles",         icon: Users            },
    { label: "Nginx",         href: "/nginx",          icon: Server           },
    { label: "App Config",    href: "/app-config",    icon: Settings         },
];

const EXPANDED_W = 200;
const COLLAPSED_W = 52;

export default function NavSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const w = collapsed ? COLLAPSED_W : EXPANDED_W;

    return (
        <nav
            className="shrink-0 flex flex-col bg-white border-r border-zinc-200 transition-[width] duration-200 overflow-hidden"
            style={{ width: w }}
        >
            {/* header */}
            <div className="flex items-center h-12 px-3 border-b border-zinc-200 shrink-0">
                <div className="flex items-center justify-center w-7 shrink-0">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-brand" aria-hidden="true">
                        <polygon points="10,2 18,6.5 18,13.5 10,18 2,13.5 2,6.5" stroke="currentColor" strokeWidth="1.75" />
                        <polygon points="10,6 14,8.5 14,13 10,15 6,13 6,8.5" fill="currentColor" opacity="0.45" />
                    </svg>
                </div>
                {!collapsed && (
                    <span className="ml-2 font-semibold text-sm tracking-tight whitespace-nowrap text-zinc-900">
                        Edge Proxy
                    </span>
                )}
            </div>

            {/* nav links */}
            <ul className="flex-1 py-3 space-y-0.5">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                title={collapsed ? label : undefined}
                                className={`flex items-center h-9 px-3 w-full text-sm transition-colors cursor-pointer ${
                                    active
                                        ? "bg-brand/10 text-brand font-medium border-l-2 border-brand"
                                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-l-2 border-transparent"
                                }`}
                            >
                                <div className="flex items-center justify-center w-5 shrink-0">
                                    <Icon size={15} strokeWidth={1.75} />
                                </div>
                                {!collapsed && (
                                    <span className="ml-2 whitespace-nowrap overflow-hidden">{label}</span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* collapse button */}
            <div className="px-2 pb-3 shrink-0">
                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="flex items-center justify-center w-full h-9 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
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
