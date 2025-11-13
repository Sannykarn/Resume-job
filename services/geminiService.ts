
import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, JobFilters } from '../types';

// Fix: Remove unnecessary `as string` type cast for `process.env.API_KEY` to align with coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const profileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The full name of the person." },
        summary: { type: Type.STRING, description: "A brief professional summary of the person."},
        skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key technical and soft skills." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the person's main strengths based on their experience."},
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of potential areas for improvement or skills they lack for their career goal."},
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["role", "company", "duration", "description"]
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.STRING }
                },
                required: ["degree", "institution", "year"]
            }
        },
        careerGoal: { type: Type.STRING, description: "The stated career goal of the individual." }
    },
    required: ["name", "summary", "skills", "strengths", "weaknesses", "experience", "education", "careerGoal"]
};

const learningPathSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Title of the learning module." },
            description: { type: Type.STRING, description: "Brief description of what this module covers." },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "Priority of this module for the user's career goal." },
            resources: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        url: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['video', 'article', 'course'] }
                    },
                    required: ["name", "url", "type"]
                }
            },
            projectIdea: { type: Type.STRING, description: "A small project idea to practice the skills from this module." }
        },
        required: ["title", "description", "priority", "resources", "projectIdea"]
    }
};

const jobsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            payScale: { type: Type.STRING },
            jobType: { type: Type.STRING },
            url: { type: Type.STRING, description: "A direct link to apply for the job."}
        },
        required: ["title", "company", "location", "description", "payScale", "jobType", "url"]
    }
};

export const parseResumeText = async (resumeText: string, careerGoal: string): Promise<UserProfile> => {
    const prompt = `Analyze the following resume text and extract the user's profile information. Identify their strengths and weaknesses based on their stated career goal of being a "${careerGoal}".

    Resume:
    ---
    ${resumeText}
    ---
    Career Goal: ${careerGoal}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: profileSchema,
            },
        });
        const jsonString = response.text;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing resume with Gemini:", error);
        throw new Error("Failed to analyze the resume. Please check the format and try again.");
    }
};


export const generateLearningPath = async (profile: UserProfile) => {
    const prompt = `Based on the following user profile, create a personalized, step-by-step learning path to help them achieve their career goal of "${profile.careerGoal}". Focus on turning their weaknesses into strengths and enhancing their existing skills. Provide a mix of articles, videos, and official documentation as resources.

    **User Profile:**
    - **Skills:** ${profile.skills.join(', ')}
    - **Strengths:** ${profile.strengths.join(', ')}
    - **Weaknesses to address:** ${profile.weaknesses.join(', ')}
    
    Generate a concise list of learning modules.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: learningPathSchema,
        },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
};

export const findJobs = async (profile: UserProfile, filters: JobFilters) => {
    let prompt = `Find relevant job opportunities for a candidate with the following profile:
    - **Career Goal:** ${profile.careerGoal}
    - **Skills:** ${profile.skills.join(', ')}
    - **Experience Summary:** ${profile.summary}

    Apply the following filters:
    - **Location/Area:** ${filters.area || 'any'}
    - **Job Type:** ${filters.jobType}
    - **Experience Level:** ${filters.experience}

    Provide a list of 10-15 suitable jobs.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: jobsSchema,
        },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
};