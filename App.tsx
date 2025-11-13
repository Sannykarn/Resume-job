import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ProfileInput } from './components/ProfileInput';
import { LearningPath } from './components/LearningPath';
import { JobFinder } from './components/JobFinder';
import type { UserProfile, View } from './types';
import { UserIcon } from './components/icons/UserIcon';
import { CodeIcon } from './components/icons/CodeIcon';

// A new component for the user profile summary card
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
  const [view, setView] = useState<View>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileGenerated = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    setView('learning');
    setIsLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    setUserProfile(null);
    setView('profile');
    setError(null);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    if (!userProfile) {
      return (
        <ProfileInput
          onProfileGenerated={handleProfileGenerated}
          setIsLoading={setIsLoading}
          setError={setError}
          isLoading={isLoading}
        />
      );
    }
    
    // Dashboard Layout
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/3">
          <UserProfileCard profile={userProfile} />
        </aside>
        <div className="lg:w-2/3">
          {view === 'learning' && <LearningPath userProfile={userProfile} />}
          {view === 'jobs' && <JobFinder userProfile={userProfile} />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans">
      <Header 
        currentView={view} 
        setView={setView} 
        hasProfile={!!userProfile}
        onReset={handleReset}
      />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-fade-in" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by AI. Your intelligent guide to a brighter future.</p>
      </footer>
    </div>
  );
}