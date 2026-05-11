import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import { signInAdmin } from '../services/authService';

export default function AdminLogin({ onLoginSuccess }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    if (showForgotPassword) {
        return (
            <ForgotPassword
                initialEmail={credentials.email}
                onBack={() => setShowForgotPassword(false)}
            />
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await signInAdmin(credentials.email, credentials.password);
            onLoginSuccess(result);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(180deg, #002442 0%, #121414 100%)' }}>
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
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: '#ffffff', fontFamily: 'Rubik' }}>
                        Snow Wonder
                    </span>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8 border" style={{ background: '#002442', borderColor: '#333535' }}>
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#ffffff', fontFamily: 'Rubik' }}>
                            Admin Portal
                        </h1>
                        <p className="text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                            Sign in to access the dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(147,0,10,0.2)', borderColor: 'rgba(147,0,10,0.5)', color: '#ffdad6', fontFamily: 'Nunito Sans' }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#cae9ff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                placeholder="admin@example.com"
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                style={{
                                    background: '#004075',
                                    border: '1px solid #333535',
                                    color: '#ffffff',
                                    fontFamily: 'Nunito Sans',
                                }}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = '#333535'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: '#cae9ff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                style={{
                                    background: '#004075',
                                    border: '1px solid #333535',
                                    color: '#ffffff',
                                    fontFamily: 'Nunito Sans',
                                }}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = '#333535'}
                            />
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    disabled={isLoading}
                                    className="text-xs transition-colors disabled:opacity-50"
                                    style={{ color: '#acc9ef', fontFamily: 'Nunito Sans' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
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
                            {isLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        Protected access only
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <a href="#" className="text-xs transition-colors" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}