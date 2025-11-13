import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ProfileInput } from './components/ProfileInput';
import { LearningPath } from './components/LearningPath';
import { JobFinder } from './components/JobFinder';
import { Auth } from './components/Auth';
import * as authService from './services/authService';
import type { UserProfile, View } from './types';
import { UserIcon } from './components/icons/UserIcon';
import { CodeIcon } from './components/icons/CodeIcon';

const UserProfileCard: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="bg-slate-800/50 rounded-xl p-6 shadow-2xl backdrop-blur-lg border border-slate-700 lg:sticky lg:top-24 animate-fade-in">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
        <UserIcon className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
        <p className="text-blue-300 font-medium">{profile.careerGoal}</p>
      </div>
    </div>
    <p className="text-slate-400 mb-4 text-sm">{profile.summary}</p>
    <div>
      <h3 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
        <CodeIcon className="w-5 h-5" />
        Top Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {profile.skills.slice(0, 7).map(skill => (
          <span key={skill} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [view, setView] = useState<View>('learning');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading to check session
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      const profile = authService.getProfile(user);
      setCurrentUser(user);
      if (profile) {
        setUserProfile(profile);
        setView('learning');
      } else {
        setView('profile');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback((username: string) => {
    const profile = authService.getProfile(username);
    setCurrentUser(username);
    if (profile) {
      setUserProfile(profile);
      setView('learning');
    } else {
      setView('profile');
    }
  }, []);
  
  const handleSignup = useCallback((username: string) => {
      setCurrentUser(username);
      setUserProfile(null);
      setView('profile');
  }, []);

  const handleProfileGenerated = useCallback((profile: UserProfile) => {
    if (currentUser) {
      authService.saveProfile(currentUser, profile);
      setUserProfile(profile);
      setView('learning');
    }
    setIsLoading(false);
  }, [currentUser]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setUserProfile(null);
    setError(null);
    setIsLoading(false);
    setView('profile');
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center p-12">Loading...</div>;
    }

    if (!currentUser) {
      return <Auth onLogin={handleLogin} onSignup={handleSignup} login={authService.login} signup={authService.signup} />;
    }

    if (!userProfile) {
      return (
        <main className="container mx-auto px-4 py-8 md:py-12">
            <ProfileInput
            onProfileGenerated={handleProfileGenerated}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
            />
        </main>
      );
    }
    
    // Dashboard Layout
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/3">
            <UserProfileCard profile={userProfile} />
            </aside>
            <div className="lg:w-2/3">
            {view === 'learning' && <LearningPath userProfile={userProfile} />}
            {view === 'jobs' && <JobFinder userProfile={userProfile} />}
            </div>
        </div>
      </main>
    );
  };
  
  const currentViewForHeader = userProfile ? view : 'profile';

  return (
    <div className="min-h-screen text-slate-200 font-sans">
      {currentUser && (
        <Header 
          currentView={currentViewForHeader} 
          setView={setView} 
          hasProfile={!!userProfile}
          onReset={handleLogout}
          username={currentUser}
        />
      )}
      
      {error && !currentUser && ( // Only show global errors on auth screen
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-fade-in container mx-auto" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
      )}
      
      {renderContent()}
      
      {currentUser && (
        <footer className="text-center py-6 text-slate-500 text-sm">
            <p>Powered by AI. Your intelligent guide to a brighter future.</p>
        </footer>
      )}
    </div>
  );
}