import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Radio,
  Ticket,
  Users,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  role: 'Super Admin' | 'Admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, role }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'sessions', label: 'Active Sessions', icon: Radio },
    { id: 'bookings', label: 'Bookings', icon: Ticket },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'onboard', label: 'Onboard User', icon: Building2 },
  ];

  const adminTools = [
    { id: 'reports', label: 'Reports', icon: BarChart3, restricted: true },
    { id: 'settings', label: 'Settings', icon: Settings, restricted: true },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-sidebar-bg shadow-2xl flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="text-on-primary w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-sidebar-heading">ArenaDesk</h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">
          {role} Access
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 mx-2 my-1 rounded-lg text-left",
              activeView === item.id
                ? "text-sidebar-text-active bg-white/10"
                : "text-sidebar-text hover:text-sidebar-text-active hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeView === item.id && "text-primary")} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 pb-2 px-6">
          <p className="text-[10px] uppercase tracking-widest text-sidebar-text/50 font-bold">Admin Tools</p>
        </div>

        {adminTools.map((item) => (
          <button
            key={item.id}
            disabled={role === 'Admin'}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 mx-2 my-1 rounded-lg text-left group",
              role === 'Admin' ? "opacity-50 cursor-not-allowed" : "text-sidebar-text hover:text-sidebar-text-active hover:bg-white/5",
              activeView === item.id && "text-sidebar-text-active bg-primary/5 border border-primary/20"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeView === item.id && "text-primary")} />
            <span className="font-medium text-sm">{item.label}</span>
            {item.restricted && <ShieldCheck className="ml-auto w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto px-4">
        <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3 border border-primary/10">
          <img
            src="https://picsum.photos/seed/alex/100/100"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-primary/30"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-sidebar-heading">Alex Rivera</p>
            <p className="text-[10px] text-primary font-bold truncate">{role}</p>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-text hover:text-sidebar-text-active text-sm transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-error hover:brightness-125 text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
