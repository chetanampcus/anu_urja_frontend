"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, LayoutDashboard, Menu, X } from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Upload Records", icon: UploadCloud },
    { href: "/dashboard", label: "View Records", icon: LayoutDashboard },
  ];

  return (
    <div className="flex bg-[#F7F7F7] min-h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div
        className={`hidden md:flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-100 transition-all duration-300 border-r border-indigo-900/50 shadow-2xl z-20 ${collapsed ? "w-12" : "w-56"
          }`}
      >
        <div className="flex items-center justify-center h-20 border-b border-indigo-900/50 px-4">
          {collapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full px-4">
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">NavDMS</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="mt-8 flex flex-col flex-1 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="px-3">
                <Link
                  href={item.href}
                  className={`px-3 py-3 rounded-xl flex items-center transition-all duration-200 group ${isActive
                      ? "bg-indigo-600/20 text-slate-400 font-semibold border border-indigo-500/20 shadow-inner"
                      : "text-slate-400 hover:bg-[#FAFAFA]/5 hover:text-slate-200"
                    } ${collapsed ? "justify-center" : "gap-3"}`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-400" : "text-slate-400 group-hover:text-slate-300"} transition-colors`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col md:hidden transition-transform duration-300 shadow-2xl border-r border-indigo-900/50 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">NavDMS</span>
          </div>
          <button
            className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-[#FAFAFA]/10 rounded-lg transition-colors focus:outline-none"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col flex-1 mt-6 gap-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3.5 rounded-xl flex items-center gap-4 transition-all duration-200 ${isActive
                    ? "bg-indigo-600/20 text-slate-400 font-semibold border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:bg-[#FAFAFA]/5 hover:text-slate-200"
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden bg-[#F7F7F7] relative">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center bg-[#FAFAFA]/80 backdrop-blur-md border-b border-slate-200 text-slate-800 p-3 h-16 shadow-sm">
          <button
            className="p-2 text-slate-600 hover:bg-[#F0F0F0] rounded-lg transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-slate-800 text-base">NavDMS</span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;