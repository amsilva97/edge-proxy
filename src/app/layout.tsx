import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Edge Proxy",
  description: "Edge proxy management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO: Use a proper layout with a sidebar and main content area
    <html lang="en">
      <body className="flex h-screen bg-background text-foreground">
        <aside className="w-48 shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 gap-2">
          <span className="text-sm font-semibold mb-2">Edge Proxy</span>
          <Link href="/sites" className="text-sm hover:underline">
            Sites
          </Link>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </body>
    </html>
  );
}
