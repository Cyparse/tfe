import React, { useState, useEffect } from 'react';

const TABS = [
    { id: 'mentions', label: 'Mentions légales' },
    { id: 'rgpd', label: 'Politique RGPD' },
];

function Section({ title, children }) {
    return (
        <div className="mb-6">
            <h3 className="text-festival-yellow text-xs font-bold uppercase tracking-[0.25em] mb-2">{title}</h3>
            <div className="text-sm leading-relaxed" style={{ color: 'rgba(202,233,255,0.65)' }}>
                {children}
            </div>
        </div>
    );
}

function MentionsLegales() {
    return (
        <>
            <Section title="Éditeur du site">
                <p>
                    <strong className="text-white">Snow Wonder Festival ASBL</strong><br />
                    Grand-Place 1, 7500 Tournai — Belgique<br />
                    Numéro d'entreprise : BE 0123.456.789<br />
                    E-mail : <a href="mailto:info@snow-wonder.be" className="text-festival-yellow hover:underline">info@snow-wonder.be</a>
                </p>
            </Section>

            <Section title="Responsable de la publication">
                <p>Le responsable de la publication est le Conseil d'Administration de l'ASBL Snow Wonder Festival.</p>
            </Section>

            <Section title="Hébergement">
                <p>
                    Ce site est hébergé par <strong className="text-white">Supabase Inc.</strong><br />
                    970 Toa Payoh North, Singapore 318992<br />
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-festival-yellow hover:underline">https://supabase.com</a>
                </p>
            </Section>

            <Section title="Propriété intellectuelle">
                <p>
                    L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, sons, logiciels…) est la propriété exclusive de l'ASBL Snow Wonder Festival ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation commerciale est strictement interdite sans autorisation écrite préalable.
                </p>
            </Section>

            <Section title="Limitation de responsabilité">
                <p>
                    Snow Wonder Festival s'efforce de maintenir les informations publiées à jour et exactes. Toutefois, l'ASBL ne saurait être tenue responsable des erreurs, omissions ou des résultats qui pourraient être obtenus par un mauvais usage de ces informations.
                </p>
            </Section>

            <Section title="Droit applicable">
                <p>
                    Le présent site et ses conditions d'utilisation sont régis par le droit belge. Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des tribunaux de l'arrondissement judiciaire de Tournai.
                </p>
            </Section>
        </>
    );
}

function PolitiqueRGPD() {
    return (
        <>
            <Section title="Responsable du traitement">
                <p>
                    <strong className="text-white">Snow Wonder Festival ASBL</strong><br />
                    Grand-Place 1, 7500 Tournai — Belgique<br />
                    Contact : <a href="mailto:privacy@snow-wonder.be" className="text-festival-yellow hover:underline">privacy@snow-wonder.be</a>
                </p>
            </Section>

            <Section title="Données collectées">
                <p>Nous collectons uniquement les données nécessaires à nos services :</p>
                <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
                    <li><strong className="text-white">Formulaire de contact</strong> — nom, adresse e-mail, sujet, message</li>
                    <li><strong className="text-white">Billetterie</strong> — nom, prénom, adresse e-mail</li>
                    <li><strong className="text-white">Inscription compétition</strong> — nom, prénom, catégorie, coordonnées</li>
                    <li><strong className="text-white">Données techniques</strong> — adresse IP, logs de connexion (finalité de sécurité)</li>
                </ul>
            </Section>

            <Section title="Finalités du traitement">
                <ul className="list-disc list-inside flex flex-col gap-1">
                    <li>Gestion des demandes de contact</li>
                    <li>Envoi et contrôle des billets d'entrée</li>
                    <li>Administration des inscriptions à la compétition</li>
                    <li>Amélioration et sécurisation du site</li>
                </ul>
                <p className="mt-2">
                    Base légale : exécution d'un contrat ou de mesures précontractuelles (Art. 6(1)(b) RGPD) et intérêt légitime (Art. 6(1)(f) RGPD).
                </p>
            </Section>

            <Section title="Durée de conservation">
                <ul className="list-disc list-inside flex flex-col gap-1">
                    <li>Données de contact : 2 ans après le dernier échange</li>
                    <li>Données billetterie et inscription : 5 ans (obligations légales comptables)</li>
                    <li>Logs techniques : 12 mois</li>
                </ul>
            </Section>

            <Section title="Partage des données">
                <p>
                    Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales. Elles peuvent être transmises à nos sous-traitants techniques (hébergeur, service d'e-mailing) uniquement dans le cadre de l'exécution de nos services, sous contrat de traitement conforme au RGPD.
                </p>
            </Section>

            <Section title="Vos droits">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
                    <li><strong className="text-white">Accès</strong> — obtenir une copie de vos données</li>
                    <li><strong className="text-white">Rectification</strong> — corriger des données inexactes</li>
                    <li><strong className="text-white">Effacement</strong> — demander la suppression de vos données</li>
                    <li><strong className="text-white">Opposition</strong> — s'opposer à certains traitements</li>
                    <li><strong className="text-white">Portabilité</strong> — recevoir vos données dans un format structuré</li>
                    <li><strong className="text-white">Limitation</strong> — restreindre temporairement un traitement</li>
                </ul>
                <p className="mt-2">
                    Pour exercer ces droits, contactez-nous à{' '}
                    <a href="mailto:privacy@snow-wonder.be" className="text-festival-yellow hover:underline">privacy@snow-wonder.be</a>.
                    Vous disposez également du droit d'introduire une réclamation auprès de l'{' '}
                    <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-festival-yellow hover:underline">Autorité de Protection des Données (APD)</a>.
                </p>
            </Section>

            <Section title="Cookies">
                <p>
                    Ce site n'utilise pas de cookies de traçage ou publicitaires. Des cookies techniques strictement nécessaires au bon fonctionnement du site (session, sécurité) peuvent être déposés sans consentement préalable, conformément à la réglementation ePrivacy.
                </p>
            </Section>

            <Section title="Mise à jour">
                <p>Dernière mise à jour : mai 2026. Nous nous réservons le droit de modifier cette politique à tout moment. La version en vigueur est toujours accessible via ce lien.</p>
            </Section>
        </>
    );
}

export default function LegalModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('mentions');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setActiveTab('mentions');
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-4"
            style={{ background: 'rgba(0,18,36,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full sm:max-w-2xl flex flex-col overflow-hidden"
                style={{
                    background: 'rgba(0,36,66,0.98)',
                    border: '1px solid rgba(202,233,255,0.15)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                    borderRadius: '1.5rem 1.5rem 0 0',
                    maxHeight: '92dvh',
                }}
                onClick={e => e.stopPropagation()}
            >
                <style>{`
                    @media (min-width: 640px) {
                        .legal-panel { border-radius: 1.5rem !important; max-height: 85vh !important; }
                    }
                `}</style>

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(202,233,255,0.2)' }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 shrink-0" style={{ borderBottom: '1px solid rgba(202,233,255,0.1)' }}>
                    <div>
                        <p className="text-festival-yellow text-xs font-bold uppercase tracking-[0.3em] mb-1">Informations légales</p>
                        <h2 className="font-display text-2xl sm:text-3xl text-white">Mentions &amp; RGPD</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full transition-colors shrink-0"
                        style={{ background: 'rgba(202,233,255,0.08)', color: 'rgba(202,233,255,0.6)' }}
                        aria-label="Fermer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-5 sm:px-8 pt-4 gap-2 shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                            style={{
                                background: activeTab === tab.id ? 'var(--color-festival-yellow)' : 'rgba(202,233,255,0.06)',
                                color: activeTab === tab.id ? '#002442' : 'rgba(202,233,255,0.55)',
                                border: activeTab === tab.id ? 'none' : '1px solid rgba(202,233,255,0.12)',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-5 sm:px-8 py-5 sm:py-6">
                    {activeTab === 'mentions' ? <MentionsLegales /> : <PolitiqueRGPD />}
                </div>
            </div>
        </div>
    );
}
