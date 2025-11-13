import React from 'react';
import type { View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { CodeIcon } from './icons/CodeIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  hasProfile: boolean;
  onReset: () => void; // This is now logout
  username: string;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, hasProfile, onReset, username }) => {
  const NavButton = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => {
    const isActive = currentView === view;
    const isDisabled = !hasProfile && view !== 'profile';

    if (view === 'profile' && hasProfile) {
        return null; // Don't show profile button if a profile exists
    }

    return (
      <button
        onClick={() => setView(view)}
        disabled={isDisabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm md:text-base rounded-md transition-all duration-300 transform hover:scale-105 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-700/50 hover:bg-slate-600/80'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {icon}
        {label}
      </button>
    );
  };
  
  const handleLogoClick = () => {
    if (hasProfile) {
        setView('learning');
    } else {
        setView('profile');
    }
  }

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-slate-900/50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
           <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <CodeIcon className="w-5 h-5 text-white" />
            </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            AI Career Path
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <NavButton view="profile" label="Create Profile" icon={<UserIcon className="w-5 h-5" />} />
          <NavButton view="learning" label="Learning" icon={<CodeIcon className="w-5 h-5" />} />
          <NavButton view="jobs" label="Jobs" icon={<BriefcaseIcon className="w-5 h-5" />} />
          <div className="flex items-center gap-2 pl-2 border-l border-slate-600">
             <span className="text-sm text-slate-300 hidden sm:block">Welcome, {username}</span>
             <button onClick={onReset} className="flex items-center justify-center p-2 text-sm rounded-md bg-slate-700/50 hover:bg-red-500/50 transition-colors" title="Logout">
                <LogoutIcon className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>
    </header>
  );
};