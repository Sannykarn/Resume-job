
export interface UserProfile {
  name: string;
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  experience: Experience[];
  education: Education[];
  careerGoal: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface LearningModule {
  title: string;
  description: string;
  resources: { name: string; url: string; type: 'video' | 'article' | 'course' }[];
  projectIdea: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  payScale: string;
  jobType: string;
  url: string;
}

export interface JobFilters {
  area: string;
  jobType: 'any' | 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  experience: 'any' | 'Fresher' | '1-3 years' | '3+ years';
}

export type View = 'profile' | 'learning' | 'jobs' | 'editing';