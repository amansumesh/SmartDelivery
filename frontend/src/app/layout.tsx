import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Package, Warehouse, Truck, Workflow, Layers } from 'lucide-react';

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
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-xs">
            <div className="p-5 border-b border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-950 tracking-tight leading-none">Smart<span className="text-red-600">Delivery</span></h1>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Logistics Engine</p>
              </div>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 transition">
                <LayoutDashboard className="w-4 h-4 text-slate-500 group-hover:text-red-600" /> Dashboard
              </Link>
              <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 transition">
                <Package className="w-4 h-4 text-slate-500" /> Orders
              </Link>
              <Link href="/warehouses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 transition">
                <Warehouse className="w-4 h-4 text-slate-500" /> Warehouses
              </Link>
              <Link href="/vehicles" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 transition">
                <Truck className="w-4 h-4 text-slate-500" /> Vehicles
              </Link>
              <Link href="/allocation" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-red-50 hover:text-red-700 transition">
                <Workflow className="w-4 h-4 text-slate-500" /> Allocation Engine
              </Link>
              <Link href="/patterns" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50/60 text-red-700 font-semibold border border-red-200/60 hover:bg-red-50 transition">
                <Layers className="w-4 h-4 text-red-600" /> Pattern Lab
              </Link>
            </nav>
          </aside>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-xs">
              <div className="font-semibold text-base text-slate-800">Dispatch &amp; Allocation System</div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200">Production Mode</span>
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">SD</div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
