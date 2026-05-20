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
            setSuccessMessage('E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception pour le lien sécurisé.');
        } catch (err) {
            setError(err.message || 'Impossible d\'envoyer l\'e-mail de réinitialisation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(180deg, var(--color-midblue) 0%, var(--color-deep-navy) 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--color-festival-yellow)' }}>
                        <span className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-dark-brown)' }}>
                            ac_unit
                        </span>
                    </div>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                        Snow Wonder
                    </span>
                </div>

                <div className="rounded-2xl p-8 border" style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1 text-xs mb-6 transition-colors"
                        style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Retour à la connexion
                    </button>

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                            Entrez votre e-mail admin et nous vous enverrons un lien de réinitialisation.
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-5">
                        {error && (
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(147,0,10,0.2)', borderColor: 'rgba(147,0,10,0.5)', color: '#ffdad6', fontFamily: 'var(--font-family-body)' }}>
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="rounded-lg p-3 text-sm border"
                                style={{ background: 'rgba(3,38,54,0.6)', borderColor: '#accbe0', color: '#accbe0', fontFamily: 'var(--font-family-body)' }}>
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                                Adresse e-mail
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
                                    background: '#004075',
                                    border: '1px solid var(--color-midblue)',
                                    color: '#ffffff',
                                    fontFamily: 'var(--font-family-body)',
                                }}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                            style={{
                                background: isLoading ? 'var(--color-deep-navy)' : '#acc9ef',
                                color: '#123250',
                                fontFamily: 'var(--font-family-body)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {isLoading ? 'Envoi en cours…' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                        Le lien de réinitialisation ouvre un écran de mise à jour sécurisé dans cette application.
                    </p>
                </div>
            </div>
        </div>
    );
}