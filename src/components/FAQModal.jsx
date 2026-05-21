import React, { useState, useEffect } from 'react';

const FAQS = [
    {
        q: "Quand et où se déroule le Snow Wonder Festival ?",
        a: "Le festival se tient chaque hiver à Bruxelles. Les dates exactes de chaque édition sont annoncées sur le site et sur nos réseaux sociaux. Consultez la section Programme pour les horaires détaillés."
    },
    {
        q: "Comment acheter des billets ?",
        a: "Les billets sont disponibles directement sur ce site via la section Billetterie. Vous recevrez votre billet par e-mail après confirmation du paiement."
    },
    {
        q: "Comment s'inscrire à la compétition de sculptures sur neige ?",
        a: "Remplissez le formulaire d'inscription dans la section Inscription. Les places sont limitées ; les inscriptions se ferment dès que le quota est atteint."
    },
    {
        q: "Quelles sont les catégories de compétition ?",
        a: "Le festival propose plusieurs catégories : Amateur, Semi-pro et Pro. Choisissez la catégorie correspondant à votre niveau lors de l'inscription."
    },
    {
        q: "Les billets sont-ils remboursables ?",
        a: "Les billets ne sont pas remboursables, mais ils sont échangeables contre une autre date de la même édition dans la limite des places disponibles. Contactez-nous pour toute demande."
    },
    {
        q: "Y a-t-il un parking sur place ?",
        a: "Oui, un parking est disponible à proximité du site. Nous recommandons toutefois les transports en commun. Retrouvez les informations d'accès dans la section Nous Trouver."
    },
    {
        q: "Le festival est-il accessible aux personnes à mobilité réduite ?",
        a: "Oui, le site est aménagé pour l'accessibilité PMR : accès de plain-pied, sanitaires adaptés et zones dédiées. N'hésitez pas à nous contacter pour toute assistance particulière."
    },
    {
        q: "Les animaux sont-ils acceptés ?",
        a: "Les animaux de compagnie sont admis sur le site du festival, à condition qu'ils soient tenus en laisse. Merci de veiller à leur comportement et à nettoyer après eux."
    },
    {
        q: "Comment contacter l'équipe organisatrice ?",
        a: "Utilisez le formulaire de contact disponible sur ce site ou écrivez-nous directement à info@snow-wonder.be. Nous répondons sous 48 heures ouvrables."
    },
];

export default function FAQModal({ isOpen, onClose }) {
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setOpenIndex(null);
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const toggle = (i) => setOpenIndex(prev => prev === i ? null : i);

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,18,36,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
                style={{ background: 'rgba(0,36,66,0.96)', border: '1px solid rgba(202,233,255,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 shrink-0" style={{ borderBottom: '1px solid rgba(202,233,255,0.1)' }}>
                    <div>
                        <p className="text-festival-yellow text-xs font-bold uppercase tracking-[0.3em] mb-1">Assistance</p>
                        <h2 className="font-display text-3xl text-white">Questions fréquentes</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: 'rgba(202,233,255,0.08)', color: 'rgba(202,233,255,0.6)' }}
                        aria-label="Fermer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* FAQ list */}
                <div className="overflow-y-auto px-8 py-6 flex flex-col gap-3">
                    {FAQS.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-2xl overflow-hidden transition-colors"
                            style={{ background: openIndex === i ? 'rgba(202,233,255,0.07)' : 'rgba(202,233,255,0.03)', border: `1px solid ${openIndex === i ? 'rgba(202,233,255,0.18)' : 'rgba(202,233,255,0.08)'}` }}
                        >
                            <button
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
                                onClick={() => toggle(i)}
                            >
                                <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
                                <span
                                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform"
                                    style={{
                                        background: openIndex === i ? 'var(--color-festival-yellow)' : 'rgba(232,169,78,0.15)',
                                        color: openIndex === i ? '#002442' : 'var(--color-festival-yellow)',
                                        transform: openIndex === i ? 'rotate(45deg)' : 'none',
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </button>

                            {openIndex === i && (
                                <div className="px-5 pb-5">
                                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(202,233,255,0.65)' }}>{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="px-8 py-5 shrink-0 text-center" style={{ borderTop: '1px solid rgba(202,233,255,0.1)' }}>
                    <p className="text-xs" style={{ color: 'rgba(202,233,255,0.4)' }}>
                        Vous ne trouvez pas votre réponse ?{' '}
                        <button onClick={onClose} className="underline transition-colors hover:text-white" style={{ color: 'rgba(202,233,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            Contactez-nous
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
