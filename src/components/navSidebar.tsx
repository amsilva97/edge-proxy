"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Settings, ShieldCheck, Scissors, ArrowRightLeft, Users, Server, Layers, CornerDownRight, FolderOpen, PanelLeftClose, PanelLeftOpen, LogOut, type LucideIcon } from "lucide-react";
import { logout } from "@/libs/auth.actions";

interface NavLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface NavGroup {
    group: string;
    links: NavLink[];
}

interface NavDivider {
    divider: true;
}

const nav: (NavLink | NavGroup | NavDivider)[] = [
    {
        group: 'Http',
        links: [
            { label: "Hosts", href: "/http-hosts", icon: Network },
            { label: "Proxies", href: "/http-proxies", icon: ArrowRightLeft },
            { label: "Load Balancers", href: "/http-loadbalancer", icon: Layers },
            { label: "Redirects", href: "/http-redirects", icon: CornerDownRight },
            { label: "Static", href: "/http-static", icon: FolderOpen },
        ],
    },
    { divider: true },
    { label: "Snippets", href: "/snippets", icon: Scissors },
    { label: "SSLs", href: "/ssls", icon: ShieldCheck },
    { label: "Roles", href: "/roles", icon: Users },
    { divider: true },
    // { label: "Nginx", href: "/nginx", icon: Server },
    { label: "App Config", href: "/app-config", icon: Settings },
];

const EXPANDED_W = 200;
const COLLAPSED_W = 52;

function NavItem({ href, label, icon: Icon, collapsed, pathname }: NavLink & { collapsed: boolean; pathname: string }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
        <li>
            <Link
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center h-9 px-3 w-full text-sm transition-colors cursor-pointer ${active
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
}

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
            <ul className="py-3 space-y-0.5 overflow-y-auto">
                {nav.map((item, i) => {
                    if ('group' in item) {
                        return (
                            <li key={item.group}>
                                {!collapsed && (
                                    <span className="block px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 select-none">
                                        {item.group}
                                    </span>
                                )}
                                {collapsed && <div className="mt-2 mb-1 mx-3 border-t border-zinc-200" />}
                                <ul className="space-y-0.5">
                                    {item.links.map(link => (
                                        <NavItem key={link.href} {...link} collapsed={collapsed} pathname={pathname} />
                                    ))}
                                </ul>
                            </li>
                        );
                    }
                    if ('divider' in item) {
                        return <li key={`divider-${i}`} className="mx-3 my-2 border-t border-zinc-200" />;
                    }
                    return <NavItem key={item.href} {...item} collapsed={collapsed} pathname={pathname} />;
                })}
            </ul>

            {/* spacer */}
            <div className="flex-1" />

            {/* logout + collapse */}
            <div className="px-2 pb-3 shrink-0 flex flex-col gap-1">
                <button
                    onClick={() => logout()}
                    title="Log out"
                    className="flex items-center justify-center w-full h-9 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <LogOut size={15} strokeWidth={1.75} />
                    {!collapsed && <span className="ml-2 text-sm">Log out</span>}
                </button>
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
