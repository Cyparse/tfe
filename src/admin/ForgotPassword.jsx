import React, { useState } from 'react';
import { requestPasswordReset } from '../services/authService';

export default function ForgotPassword({ initialEmail = '', onBack }) {
    const [email, setEmail] = useState(initialEmail);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const redirectTo = `${window.location.origin}${window.location.pathname}?mode=update-password`;
            await requestPasswordReset(email, redirectTo);
            setSuccessMessage('Password reset email sent. Check your inbox for the secure link.');
        } catch (err) {
            setError(err.message || 'Unable to send the password reset email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-blue-200 hover:text-white text-sm flex items-center transition-colors"
                        >
                            ← Back to login
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
                        <p className="text-blue-200">Enter your admin email and we will send you a reset link.</p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 text-emerald-100 text-sm">
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                placeholder="admin@example.com"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? 'Sending reset email...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-blue-300">
                        <p>The reset link opens a secure password update screen in this app.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}