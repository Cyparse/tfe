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
        if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
        if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
        setIsLoading(true);
        try {
            await updatePassword(password);
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsComplete(true);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Impossible de mettre à jour le mot de passe.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        background: '#004075',
        border: '1px solid var(--color-midblue)',
        color: '#ffffff',
        fontFamily: 'var(--font-family-body)',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(180deg, var(--color-midblue) 0%, var(--color-deep-navy) 100%)' }}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-festival-yellow)' }}>
                        <span className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-dark-brown)' }}>ac_unit</span>
                    </div>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                        Snow Wonder
                    </span>
                </div>

                <div className="rounded-2xl p-8 border" style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                            Définir un nouveau mot de passe
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                            {isRecoveryReady
                                ? 'Choisissez un nouveau mot de passe pour votre compte admin.'
                                : 'Ouvrez le lien de réinitialisation depuis votre e-mail pour continuer.'}
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg p-3 text-sm border mb-5"
                            style={{ background: 'rgba(147,0,10,0.2)', borderColor: 'rgba(147,0,10,0.5)', color: '#ffdad6', fontFamily: 'var(--font-family-body)' }}>
                            {error}
                        </div>
                    )}

                    {isComplete ? (
                        <div className="space-y-4">
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(3,38,54,0.6)', borderColor: '#accbe0', color: '#accbe0', fontFamily: 'var(--font-family-body)' }}>
                                Mot de passe mis à jour avec succès.
                            </div>
                            <button
                                type="button"
                                onClick={onReturnToAdmin}
                                className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all"
                                style={{ background: '#acc9ef', color: '#123250', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}
                            >
                                Retour à la connexion admin
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {['Nouveau mot de passe', 'Confirmer le mot de passe'].map((label, i) => (
                                <div key={label}>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                        style={{ color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
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
                                        onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit"
                                disabled={!isRecoveryReady || isLoading}
                                className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                                style={{ background: '#acc9ef', color: '#123250', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}
                            >
                                {isLoading ? 'Mise à jour en cours…' : 'Enregistrer le nouveau mot de passe'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}