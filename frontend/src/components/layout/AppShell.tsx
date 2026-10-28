'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  Workflow,
  Layers,
  PlusCircle,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

const NAV_ITEMS: NavCategory[] = [
  {
    category: 'Operations',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/orders', label: 'Orders', icon: Package, badge: 'Live' },
      { href: '/warehouses', label: 'Warehouses', icon: Warehouse },
      { href: '/vehicles', label: 'Vehicles', icon: Truck },
      { href: '/allocation', label: 'Allocation Engine', icon: Workflow },
    ],
  },
  {
    category: 'Architecture & Design',
    items: [
      { href: '/patterns', label: 'Pattern Lab', icon: Layers },
    ],
  },
];

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Operations Dashboard', subtitle: 'Live logistics & fleet resource monitoring' },
  '/orders': { title: 'Order Management', subtitle: 'Manage, search, and allocate delivery consignments' },
  '/orders/new': { title: 'Create New Order', subtitle: 'Submit consignment for automated allocation' },
  '/warehouses': { title: 'Fulfilment Warehouses', subtitle: 'Active depot locations, coordinates & capacity' },
  '/vehicles': { title: 'Fleet Vehicles', subtitle: 'Vehicle availability, capacity limits & rate/km' },
  '/allocation': { title: 'Allocation Engine', subtitle: 'Design-pattern driven multi-criteria solver' },
  '/patterns': { title: 'Pattern Execution Lab', subtitle: 'Interactive visualizer for Factory, Strategy & Builder' },
};

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Automatically reset sidebar if route changes during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  // Handle ESC key to dismiss sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Find matching route meta
  const currentRouteMeta = ROUTE_TITLES[pathname] || {
    title: 'Dispatch & Allocation System',
    subtitle: 'Smart logistics and fleet management',
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors">
        {/* Left Section: Hamburger + Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
            className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-red-600 hover:bg-red-50 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5 transition-transform" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shadow-sm group-hover:bg-red-700 transition">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-950 tracking-tight leading-none flex items-center gap-1">
                <span>Smart</span>
                <span className="text-red-600">Delivery</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
                Logistics SaaS
              </p>
            </div>
          </Link>

          {/* Context Breadcrumb Divider on md+ screens */}
          <div className="hidden md:flex items-center pl-4 border-l border-slate-200 text-sm">
            <span className="font-semibold text-slate-800">{currentRouteMeta.title}</span>
          </div>
        </div>

        {/* Right Section: Actions & Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/orders/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Consignment
          </Link>


          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-red-100">
              SD
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Off-canvas Sliding Sidebar Menu (appears ONLY when clicking hamburger) */}
      <aside
        id="app-sidebar-drawer"
        role="dialog"
        aria-label="Navigation Sidebar"
        aria-modal="true"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shadow-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950 tracking-tight leading-none">
                Smart<span className="text-red-600">Delivery</span>
              </h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                Logistics &amp; Routing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 p-3.5 space-y-6 overflow-y-auto">
          {NAV_ITEMS.map((section) => (
            <div key={section.category} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.category}
              </div>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-semibold border border-red-200/70 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-red-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                          isActive ? 'opacity-100 translate-x-0 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Page Content (Full Width) */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
