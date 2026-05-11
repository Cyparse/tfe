import React, { useEffect, useState } from 'react';
import { getCurrentSession, onAuthStateChange, updatePassword } from '../services/authService';

export default function UpdatePassword({ onReturnToAdmin }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecoveryReady, setIsRecoveryReady] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            const session = await getCurrentSession();
            if (isMounted && session) setIsRecoveryReady(true);
        };
        init();
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) setIsRecoveryReady(true);
        });
        return () => { isMounted = false; subscription.unsubscribe(); };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) { setError('Password must contain at least 8 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
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

    const inputStyle = {
        background: '#282a2b',
        border: '1px solid #43474d',
        color: '#e2e2e2',
        fontFamily: 'Nunito Sans',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(180deg, #1e2020 0%, #121414 100%)' }}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fcba5d' }}>
                        <span className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1", color: '#452b00' }}>ac_unit</span>
                    </div>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: '#e2e2e2', fontFamily: 'Rubik' }}>
                        Snow Wonder
                    </span>
                </div>

                <div className="rounded-2xl p-8 border" style={{ background: '#1e2020', borderColor: '#333535' }}>
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#e2e2e2', fontFamily: 'Rubik' }}>
                            Set a new password
                        </h1>
                        <p className="text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                            {isRecoveryReady
                                ? 'Choose a new password for your admin account.'
                                : 'Open the password reset link from your email to continue.'}
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg p-3 text-sm border mb-5"
                            style={{ background: 'rgba(147,0,10,0.2)', borderColor: 'rgba(147,0,10,0.5)', color: '#ffdad6', fontFamily: 'Nunito Sans' }}>
                            {error}
                        </div>
                    )}

                    {isComplete ? (
                        <div className="space-y-4">
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(3,38,54,0.6)', borderColor: '#accbe0', color: '#accbe0', fontFamily: 'Nunito Sans' }}>
                                Password updated successfully.
                            </div>
                            <button
                                type="button"
                                onClick={onReturnToAdmin}
                                className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all"
                                style={{ background: '#acc9ef', color: '#123250', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}
                            >
                                Return to admin login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {['New Password', 'Confirm Password'].map((label, i) => (
                                <div key={label}>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                        style={{ color: '#c3c6ce', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                                        {label}
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={i === 0 ? password : confirmPassword}
                                        onChange={e => i === 0 ? setPassword(e.target.value) : setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={!isRecoveryReady || isLoading}
                                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                        onBlur={e => e.target.style.borderColor = '#43474d'}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit"
                                disabled={!isRecoveryReady || isLoading}
                                className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                                style={{ background: '#acc9ef', color: '#123250', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}
                            >
                                {isLoading ? 'Updating password…' : 'Save New Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}