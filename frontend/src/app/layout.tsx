import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Package, Warehouse, Truck, Workflow } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Delivery Allocation System",
  description: "Logistics SaaS Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Delivery</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Package className="w-5 h-5" /> Orders
              </Link>
              <Link href="/warehouses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Warehouse className="w-5 h-5" /> Warehouses
              </Link>
              <Link href="/vehicles" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Truck className="w-5 h-5" /> Vehicles
              </Link>
              <Link href="/allocation" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Workflow className="w-5 h-5" /> Allocation Engine
              </Link>
            </nav>
          </aside>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between">
              <div className="font-semibold text-lg text-slate-700 dark:text-slate-300">Workspace</div>
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">SD</div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
