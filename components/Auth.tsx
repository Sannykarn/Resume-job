import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CodeIcon } from './icons/CodeIcon';

interface AuthProps {
    onLogin: (username: string) => void;
    onSignup: (username: string) => void;
    login: (username: string, password: string) => Promise<{success: boolean, message: string}>;
    signup: (username: string, password: string) => Promise<{success: boolean, message: string}>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, login, signup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Username and password cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const action = isLogin ? login : signup;
            const result = await action(username, password);

            if (result.success) {
                const callback = isLogin ? onLogin : onSignup;
                callback(username);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center animate-fade-in px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800/50 rounded-xl p-8 shadow-2xl backdrop-blur-lg border border-slate-700">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                            <CodeIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-center text-slate-400 mb-8">
                        {isLogin ? 'Log in to access your career path' : 'Join to build your future'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-500 disabled:opacity-50"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" aria-label="Password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-slate-500 disabled:opacity-50"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                            />
                        </div>
                        
                        {error && (
                            <p className="text-sm text-red-400 text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isLoading ? <SpinnerIcon /> : isLogin ? 'Log In' : 'Sign Up'}
                        </button>
                    </form>
                    
                    <p className="text-center text-slate-400 mt-6 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
