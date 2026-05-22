import React, { useState, useEffect } from 'react';
import { snowflake } from '../../assets/images';
import { supabase } from '../../supabaseClient';

export default function ContactModal({ isOpen, onClose }) {
    const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | success | error

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        const { error } = await supabase.functions.invoke('send-contact', {
            body: form,
        });

        if (error) {
            setStatus('error');
        } else {
            setStatus('success');
            setForm({ nom: '', email: '', sujet: '', message: '' });
        }
    };

    const handleClose = () => {
        setStatus('idle');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-deep-navy/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl"
                style={{
                    background: 'rgba(0, 36, 66, 0.92)',
                    border: '1.5px solid rgba(202, 233, 255, 0.18)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <img src={snowflake} alt="" className="w-8 h-8 opacity-80" />
                        <h2 className="font-display text-3xl text-white">Nous contacter</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-ice-blue/60 hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
                        aria-label="Fermer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-full bg-festival-yellow/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-festival-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-white font-semibold text-lg mb-2">Message envoyé !</p>
                        <p className="text-ice-blue/60 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                        <button
                            onClick={handleClose}
                            className="mt-6 px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest text-deep-navy bg-festival-yellow hover:bg-festival-yellow/90 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-ice-blue/60 text-sm mb-6 leading-relaxed">
                            Une question ? Écrivez-nous à{' '}
                            <a href="mailto:info@snow-wonder.be" className="text-festival-yellow hover:underline">
                                info@snow-wonder.be
                            </a>
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-ice-blue/70 text-xs uppercase tracking-widest font-semibold">Nom</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={form.nom}
                                        onChange={handleChange}
                                        required
                                        placeholder="Votre nom"
                                        className="bg-white/5 border border-ice-blue/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-ice-blue/30 focus:outline-none focus:border-festival-yellow/60 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-ice-blue/70 text-xs uppercase tracking-widest font-semibold">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="votre@email.com"
                                        className="bg-white/5 border border-ice-blue/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-ice-blue/30 focus:outline-none focus:border-festival-yellow/60 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-ice-blue/70 text-xs uppercase tracking-widest font-semibold">Sujet</label>
                                <input
                                    type="text"
                                    name="sujet"
                                    value={form.sujet}
                                    onChange={handleChange}
                                    required
                                    placeholder="Objet de votre message"
                                    className="bg-white/5 border border-ice-blue/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-ice-blue/30 focus:outline-none focus:border-festival-yellow/60 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-ice-blue/70 text-xs uppercase tracking-widest font-semibold">Message</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    placeholder="Votre message..."
                                    className="bg-white/5 border border-ice-blue/20 rounded-xl px-4 py-2.5 text-white text-sm placeholder-ice-blue/30 focus:outline-none focus:border-festival-yellow/60 transition-colors resize-none"
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-red-400 text-xs text-center">
                                    Une erreur est survenue. Veuillez réessayer ou écrire directement à info@snow-wonder.be
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="mt-2 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-deep-navy bg-festival-yellow hover:bg-festival-yellow/90 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
