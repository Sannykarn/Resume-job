import React, { useState, useCallback, useEffect } from 'react';
import { parseResumeText } from '../services/geminiService';
import type { UserProfile } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

const formatProfileToText = (profile: UserProfile): string => {
    let text = `Name: ${profile.name}\n\n`;
    text += `Summary:\n${profile.summary}\n\n`;
    
    if (profile.skills?.length) {
        text += `Skills:\n- ${profile.skills.join('\n- ')}\n\n`;
    }

    if (profile.experience?.length) {
        text += 'Experience:\n';
        profile.experience.forEach(exp => {
            text += `---\nRole: ${exp.role}\n`;
            text += `Company: ${exp.company}\n`;
            text += `Duration: ${exp.duration}\n`;
            text += `Description: ${exp.description}\n`;
        });
        text += '---\n\n';
    }

    if (profile.education?.length) {
        text += 'Education:\n';
        profile.education.forEach(edu => {
            text += `---\nDegree: ${edu.degree}\n`;
            text += `Institution: ${edu.institution}\n`;
            text += `Year: ${edu.year}\n`;
        });
        text += '---\n';
    }

    return text.trim();
};

interface ProfileInputProps {
  onProfileGenerated: (profile: UserProfile) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  initialProfile?: UserProfile | null;
  onCancel?: () => void;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({ 
    onProfileGenerated, 
    setIsLoading, 
    setError, 
    isLoading, 
    initialProfile = null,
    onCancel
}) => {
  const [resumeText, setResumeText] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const isEditing = !!initialProfile;

  useEffect(() => {
    if (initialProfile) {
      setResumeText(formatProfileToText(initialProfile));
      setCareerGoal(initialProfile.careerGoal);
      setFileName(''); // Clear file name when editing
    } else {
      // Clear fields when switching to create mode (e.g., after logout/new signup)
      setResumeText('');
      setCareerGoal('');
      setFileName('');
    }
  }, [initialProfile]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsParsing(true);
      setError(null);
      
      if (file.type === 'application/pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument(typedArray).promise;
              let text = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
              }
              setResumeText(text);
            } catch (pdfError) {
              console.error("Error parsing PDF:", pdfError);
              setError("Could not read text from PDF. Please ensure it's a text-based PDF.");
            } finally {
              setIsParsing(false);
            }
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error("Error loading PDF library:", err);
            setError("Could not load PDF parser. Please try again or paste text manually.");
            setIsParsing(false);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string);
          setIsParsing(false);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeText.trim() || !careerGoal.trim()) {
      setError('Please provide your details/resume and a career goal.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const profile = await parseResumeText(resumeText, careerGoal);
      onProfileGenerated(profile);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [resumeText, careerGoal, setIsLoading, setError, onProfileGenerated]);
  
  const isDisabled = isLoading || isParsing;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="bg-slate-800/50 rounded-xl p-8 shadow-2xl backdrop-blur-lg border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
          {isEditing ? 'Edit Your Career Profile' : 'Create Your Career Profile'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isEditing
            ? 'Update your details below. The AI will re-analyze your profile to refine your path.'
            : 'Upload your resume or paste your details below to get a personalized analysis.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="resume-text" className="block text-sm font-medium text-slate-300 mb-2">
              Paste Resume / Professional Details
            </label>
            <textarea
              id="resume-text"
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-500 disabled:opacity-50"
              placeholder="Paste your resume here, or describe your education, experience, and skills."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={isDisabled}
            />
          </div>

          <div className="text-center text-slate-400 font-semibold">OR</div>

          <div>
            <label htmlFor="resume-upload" className="block text-sm font-medium text-slate-300 mb-2">
              {isEditing ? 'Replace with new Resume (.txt, .pdf)' : 'Upload Resume (.txt, .pdf)'}
            </label>
            <label className={`w-full flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg border-2 border-dashed border-slate-500 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <svg className="w-6 h-6 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <span className="text-slate-300">{fileName || 'Choose a file...'}</span>
              <input id="resume-upload" type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileChange} disabled={isDisabled}/>
            </label>
             {isParsing && <p className="text-sm text-cyan-400 mt-2 text-center">Parsing PDF...</p>}
          </div>
          
          <div>
            <label htmlFor="career-goal" className="block text-sm font-medium text-slate-300 mb-2">
              What is your primary career goal?
            </label>
            <input
              id="career-goal"
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-500 disabled:opacity-50"
              placeholder="e.g., 'Senior Frontend Developer', 'Data Scientist', 'UX Designer'"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              disabled={isDisabled}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
            <button
                type="submit"
                disabled={isDisabled}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isLoading ? (
                <>
                    <SpinnerIcon />
                    {isEditing ? 'Updating Profile...' : 'Analyzing Profile...'}
                </>
                ) : isParsing ? (
                    'Processing...'
                ) : (
                isEditing ? 'Update AI-Powered Profile' : 'Generate AI-Powered Path'
                )}
            </button>
            {isEditing && onCancel && (
                <button
                type="button"
                onClick={onCancel}
                disabled={isDisabled}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                Cancel
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
