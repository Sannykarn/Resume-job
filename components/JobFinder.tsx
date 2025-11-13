
import React, { useState, useEffect, useCallback } from 'react';
import { findJobs } from '../services/geminiService';
import type { UserProfile, Job, JobFilters } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface JobFinderProps {
  userProfile: UserProfile;
}

export const JobFinder: React.FC<JobFinderProps> = ({ userProfile }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    area: '',
    jobType: 'any',
    experience: 'any',
  });
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const foundJobs = await findJobs(userProfile, filters);
      setJobs(foundJobs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, filters]);

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
            Job Opportunities
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
            Find roles that match your skills and <span className="font-bold text-cyan-400">{userProfile.careerGoal}</span> ambition.
            </p>
        </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="area" className="block text-sm font-medium text-slate-300 mb-1">Location / Area</label>
            <input
              type="text"
              name="area"
              id="area"
              value={filters.area}
              onChange={handleFilterChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-slate-300 mb-1">Job Type</label>
            <select name="jobType" id="jobType" value={filters.jobType} onChange={handleFilterChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="any">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
           <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-1">Experience</label>
            <select name="experience" id="experience" value={filters.experience} onChange={handleFilterChange} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="any">Any</option>
              <option value="Fresher">Fresher</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </div>
          <button
            onClick={fetchJobs}
            disabled={isLoading}
            className="md:col-start-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:from-blue-700 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <SpinnerIcon /> : 'Find Jobs'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <SpinnerIcon />
            <p className="text-xl mt-4 font-semibold text-slate-300">Searching for Jobs...</p>
            <p className="text-slate-400">Our AI is scanning the market for your perfect match.</p>
        </div>
      )}

      {error && <div className="text-center text-red-400">Error: {error}</div>}

      {!isLoading && !error && hasSearched && jobs.length === 0 && (
         <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-slate-300">No Jobs Found</h3>
            <p className="text-slate-400">Try adjusting your filters for a wider search.</p>
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div>
                <h3 className="text-lg font-bold text-cyan-300">{job.title}</h3>
                <p className="text-slate-300 font-medium">{job.company}</p>
                <p className="text-sm text-slate-400 mb-3">{job.location}</p>
                <p className="text-sm text-slate-400 mb-4 h-20 overflow-y-auto">{job.description}</p>
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  <span className="bg-slate-700 px-2 py-1 rounded-full">{job.jobType}</span>
                  <span className="bg-slate-700 px-2 py-1 rounded-full">{job.payScale}</span>
                </div>
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
