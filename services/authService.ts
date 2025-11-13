import type { UserProfile } from '../types';

// Using localStorage to simulate a database.
// In a real app, this would be a secure backend service.

const USERS_KEY = 'career_path_users';
const PROFILES_KEY = 'career_path_profiles';
const SESSION_KEY = 'career_path_session';

// Helper to get users from localStorage
const getUsers = (): Record<string, string> => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

// Helper to get profiles from localStorage
const getProfiles = (): Record<string, UserProfile> => {
    const profiles = localStorage.getItem(PROFILES_KEY);
    return profiles ? JSON.parse(profiles) : {};
};

export const signup = (username: string, password: string):Promise<{success: boolean, message: string}> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const users = getUsers();
            if (users[username]) {
                resolve({ success: false, message: 'Username already exists.' });
            } else {
                users[username] = password; // In a real app, hash the password!
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                setCurrentUser(username);
                resolve({ success: true, message: 'Signup successful!' });
            }
        }, 500);
    });
};

export const login = (username: string, password: string): Promise<{success: boolean, message: string}> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const users = getUsers();
            if (users[username] && users[username] === password) {
                setCurrentUser(username);
                resolve({ success: true, message: 'Login successful!' });
            } else {
                resolve({ success: false, message: 'Invalid username or password.' });
            }
        }, 500);
    });
};

export const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): string | null => {
    return sessionStorage.getItem(SESSION_KEY);
};

const setCurrentUser = (username: string) => {
    sessionStorage.setItem(SESSION_KEY, username);
};

export const saveProfile = (username: string, profile: UserProfile) => {
    const profiles = getProfiles();
    profiles[username] = profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getProfile = (username: string): UserProfile | null => {
    const profiles = getProfiles();
    return profiles[username] || null;
};
