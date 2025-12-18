
import React from 'react';
import { LayoutDashboard, Settings, CircleHelp, User as UserIcon, CalendarDays, BarChart2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AppView } from '../types';
import { Logo } from './Logo';

export const ActivityBar: React.FC = () => {
  const { currentView, setCurrentView, user, setIsAuthModalOpen, signOut } = useAppContext();

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`relative group w-full h-12 flex items-center justify-center mb-2 transition-all ${
        currentView === view 
          ? 'text-white' 
          : 'text-[#858585] hover:text-white'
      }`}
      title={label}
    >
      {/* Active Indicator Border */}
      {currentView === view && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      )}
      
      <Icon className={`w-6 h-6 transition-transform duration-300 ${currentView === view ? 'scale-100' : 'scale-90 group-hover:scale-100'}`} />
    </button>
  );

  const handleProfileClick = () => {
      if (user) {
          if (confirm("Sign out?")) {
              signOut();
          }
      } else {
          setIsAuthModalOpen(true);
      }
  };

  const getInitials = (name?: string) => {
      if (!name) return 'AI';
      return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-4 z-50 shrink-0 select-none shadow-xl border-r border-[#1e1e1e]">
      {/* Animated Logo */}
      <div className="mb-6 flex justify-center w-full" title="AutoPost.ai Core">
         <Logo />
      </div>

      <NavItem view="main" icon={LayoutDashboard} label="Dashboard" />
      <NavItem view="calendar" icon={CalendarDays} label="Calendar" />
      <NavItem view="benchmarks" icon={BarChart2} label="Leaderboard" />
      <NavItem view="settings" icon={Settings} label="Settings" />
      <NavItem view="help" icon={CircleHelp} label="Help" />

      <div className="mt-auto flex flex-col gap-4 items-center mb-2">
        <div 
            onClick={handleProfileClick}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold cursor-pointer hover:border-white transition-all shadow-sm
                ${user ? 'bg-gradient-to-br from-blue-600 to-purple-600 border border-transparent text-white' : 'bg-[#2d2d2d] border border-[#555] text-[#cccccc] hover:text-white'}
            `}
            title={user ? `Signed in as ${user.email}` : "Sign In"}
        >
            {user ? (
                user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full rounded-full" />
                ) : getInitials(user.email)
            ) : (
                <UserIcon className="w-3.5 h-3.5" />
            )}
        </div>
      </div>
    </div>
  );
};
