import React, { useState, useEffect, useCallback } from 'react';
import { generateLearningPath } from '../services/geminiService';
import type { UserProfile, LearningModule } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ThumbUpIcon } from './icons/ThumbUpIcon';
import { ThumbDownIcon } from './icons/ThumbDownIcon';
import { CheckIcon } from './icons/CheckIcon';

interface LearningPathProps {
  userProfile: UserProfile;
}

const PriorityBadge: React.FC<{ priority: 'High' | 'Medium' | 'Low' }> = ({ priority }) => {
  const colors = {
    High: 'bg-red-500/20 text-red-300 border-red-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    Low: 'bg-green-500/20 text-green-300 border-green-500/50',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[priority]}`}>
      {priority} Priority
    </span>
  );
};


type ResourceStatus = {
    completed: boolean;
    feedback: 'up' | 'down' | null;
}

export const LearningPath: React.FC<LearningPathProps> = ({ userProfile }) => {
  const [learningPath, setLearningPath] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceStatus, setResourceStatus] = useState<Record<string, ResourceStatus>>({});

  const fetchLearningPath = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const path = await generateLearningPath(userProfile);
      setLearningPath(path);
      // Initialize status for all resources
      const initialStatus: Record<string, ResourceStatus> = {};
      path.forEach((module: LearningModule) => {
        module.resources.forEach(res => {
          initialStatus[res.url] = { completed: false, feedback: null };
        });
      });
      setResourceStatus(initialStatus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);
  
  const handleToggleComplete = (url: string) => {
    setResourceStatus(prev => ({
        ...prev,
        [url]: { ...prev[url], completed: !prev[url].completed }
    }));
  };

  const handleFeedback = (url: string, feedback: 'up' | 'down') => {
      setResourceStatus(prev => ({
          ...prev,
          [url]: { ...prev[url], feedback: prev[url].feedback === feedback ? null : feedback }
      }));
  };
  
  const ResourceItem: React.FC<{ resource: LearningModule['resources'][0] }> = ({ resource }) => {
    const status = resourceStatus[resource.url] || { completed: false, feedback: null };
    const icon = resource.type === 'video' ? '🎬' : resource.type === 'article' ? '📄' : '🎓';
    
    return (
      <div className={`flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg transition-all duration-300 ${status.completed ? 'opacity-60' : ''}`}>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-grow flex items-center gap-2"
        >
          <span className="text-lg">{icon}</span>
          <span className={`truncate text-blue-300 hover:underline ${status.completed ? 'line-through' : ''}`}>
              {resource.name}
          </span>
        </a>
        <div className="flex items-center gap-1 flex-shrink-0">
            <button 
                onClick={() => handleFeedback(resource.url, 'up')}
                aria-label="Mark as useful"
                className={`p-1 rounded-full hover:bg-slate-600 transition-colors ${status.feedback === 'up' ? 'text-green-400' : 'text-slate-400'}`}
            >
                <ThumbUpIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={() => handleFeedback(resource.url, 'down')}
                aria-label="Mark as not useful"
                className={`p-1 rounded-full hover:bg-slate-600 transition-colors ${status.feedback === 'down' ? 'text-red-400' : 'text-slate-400'}`}
            >
                <ThumbDownIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={() => handleToggleComplete(resource.url)} 
                aria-label="Mark as complete"
                className={`p-1 rounded-full hover:bg-slate-600 transition-colors ${status.completed ? 'text-green-400' : 'text-slate-400'}`}
            >
                <CheckIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <SpinnerIcon />
        <p className="text-xl mt-4 font-semibold text-slate-300">Generating Your Personalized Learning Path...</p>
        <p className="text-slate-400">Our AI is crafting the perfect steps for your career goal.</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400">Error: {error}</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
          Your AI-Curated Learning Path
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Follow these modules to build the skills you need for your goal as a <span className="font-bold text-cyan-400">{userProfile.careerGoal}</span>.
        </p>
      </div>
      
      <div className="space-y-6">
        {learningPath.map((module, index) => (
          <div 
            key={index} 
            className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700 transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-cyan-300">{index + 1}. {module.title}</h3>
              <PriorityBadge priority={module.priority} />
            </div>
            <p className="text-slate-400 mb-4">{module.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Recommended Resources</h4>
                <div className="space-y-2">
                  {module.resources.map((res, i) => (
                    <ResourceItem key={i} resource={res} />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Project Idea</h4>
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm">{module.projectIdea}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};