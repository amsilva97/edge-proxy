"use client";

import Notifier from "@/components/notifier";
import NavSidebar from "@/components/navSidebar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex">
            <Notifier />
            <NavSidebar />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
