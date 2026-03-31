import React from 'react';
import { Search, Bell, Clock, UserPlus, Plus, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  title: string;
  onNewBooking: () => void;
  onOnboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNewBooking, onOnboard }) => {
  const [time, setTime] = React.useState(new Date());
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-[240px] h-[56px] z-40 bg-header-bg backdrop-blur-xl flex justify-between items-center px-6 w-auto border-b border-border">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-heading">{title}</h2>
        <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-mono text-primary border border-primary/20">
          LIVE: {time.toLocaleTimeString([], { hour12: false })}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-muted mr-4">
          <button className="p-1.5 hover:text-heading hover:bg-surface-container rounded-lg transition-all">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-heading hover:bg-surface-container rounded-lg transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:text-heading hover:bg-surface-container rounded-lg transition-all relative overflow-hidden w-8 h-8 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ y: 12, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -12, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ y: 12, opacity: 0, rotate: 90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -12, opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-heading">System Live</span>
          </div>
        </div>

        <button 
          onClick={onOnboard}
          className="bg-surface-container-high hover:bg-surface-container-highest transition-all px-4 py-1.5 rounded-xl text-on-surface text-xs font-bold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Onboard New User
        </button>

        <button 
          onClick={onNewBooking}
          className="bg-primary hover:brightness-110 active:scale-95 transition-all px-4 py-1.5 rounded-xl text-on-primary text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>
    </header>
  );
};
