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
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(180deg, #1e2020 0%, #121414 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: '#fcba5d' }}>
                        <span className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1", color: '#452b00' }}>
                            ac_unit
                        </span>
                    </div>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: '#e2e2e2', fontFamily: 'Rubik' }}>
                        Snow Wonder
                    </span>
                </div>

                <div className="rounded-2xl p-8 border" style={{ background: '#1e2020', borderColor: '#333535' }}>
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1 text-xs mb-6 transition-colors"
                        style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to login
                    </button>

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#e2e2e2', fontFamily: 'Rubik' }}>
                            Forgot password?
                        </h1>
                        <p className="text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                            Enter your admin email and we'll send you a reset link.
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-5">
                        {error && (
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(147,0,10,0.2)', borderColor: 'rgba(147,0,10,0.5)', color: '#ffdad6', fontFamily: 'Nunito Sans' }}>
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(3,38,54,0.6)', borderColor: '#accbe0', color: '#accbe0', fontFamily: 'Nunito Sans' }}>
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#c3c6ce', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                style={{
                                    background: '#282a2b',
                                    border: '1px solid #43474d',
                                    color: '#e2e2e2',
                                    fontFamily: 'Nunito Sans',
                                }}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = '#43474d'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                            style={{
                                background: isLoading ? '#002442' : '#acc9ef',
                                color: '#123250',
                                fontFamily: 'Nunito Sans',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {isLoading ? 'Sending reset email…' : 'Reset Password'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        The reset link opens a secure password update screen in this app.
                    </p>
                </div>
            </div>
        </div>
    );
}