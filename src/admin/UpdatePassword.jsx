import React, { useEffect, useState } from 'react';
import {
    getCurrentSession,
    onAuthStateChange,
    updatePassword
} from '../services/authService';

export default function UpdatePassword({ onReturnToAdmin }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecoveryReady, setIsRecoveryReady] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initializeRecovery = async () => {
            const session = await getCurrentSession();

            if (!isMounted) {
                return;
            }

            if (session) {
                setIsRecoveryReady(true);
            }
        };

        initializeRecovery();

        const {
            data: { subscription }
        } = onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
                setIsRecoveryReady(true);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            await updatePassword(password);
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsComplete(true);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Unable to update the password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Set a new password</h1>
                        <p className="text-blue-200">
                            {isRecoveryReady
                                ? 'Choose a new password for your admin account.'
                                : 'Open the password reset link from your email to continue.'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {isComplete ? (
                        <div className="space-y-4">
                            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 text-emerald-100 text-sm">
                                Password updated successfully.
                            </div>

                            <button
                                type="button"
                                onClick={onReturnToAdmin}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Return to admin login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={!isRecoveryReady || isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={!isRecoveryReady || isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!isRecoveryReady || isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? 'Updating password...' : 'Save New Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}