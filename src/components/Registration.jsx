import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Registration() {
const EDITIONS = [
    { value: 'december', label: 'Édition Décembre', date: '6 déc. 2026' },
    { value: 'january',  label: 'Édition Janvier',  date: '10 jan. 2027' },
    { value: 'february', label: 'Édition Février',  date: '7 fév. 2027' },
];

    const [formData, setFormData] = useState({
        type: 'amateur',
        editions: [],
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        experience: '',
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [registeredEditions, setRegisteredEditions] = useState([]);

    useEffect(() => {
        const checkRegistration = async () => {
            if (formData.email && formData.email.includes('@')) {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('festival_edition')
                    .ilike('email', formData.email);

                if (!error && data) {
                    setRegisteredEditions(data.map(r => r.festival_edition));
                } else {
                    setRegisteredEditions([]);
                }
            } else {
                setRegisteredEditions([]);
            }
        };

        const timeoutId = setTimeout(checkRegistration, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom est requis';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "L'e-mail est requis";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Format d'e-mail invalide";
        }

        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est requis';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Numéro de téléphone invalide';
        }

        if (formData.type === 'pro') {
            if (!formData.organization.trim()) {
                newErrors.organization = "L'organisation est requise pour les professionnels";
            }
            if (!formData.experience.trim()) {
                newErrors.experience = "Les détails d'expérience sont requis";
            }
        }

        if (formData.editions.length === 0) {
            newErrors.editions = 'Veuillez sélectionner au moins une édition';
        }

        if (!formData.terms) {
            newErrors.terms = 'Vous devez accepter les conditions générales';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Filter out editions already registered for
            const newEditions = formData.editions.filter(ed => !registeredEditions.includes(ed));

            if (newEditions.length === 0) {
                setErrors({ submit: 'Vous êtes déjà inscrit(e) pour toutes les éditions sélectionnées.' });
                setIsSubmitting(false);
                return;
            }

            // Insert one registration per selected edition
            const inserts = newEditions.map(ed => ({
                type: formData.type,
                festival_edition: ed,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                organization: formData.organization || null,
                experience: formData.experience || null,
                terms_accepted: formData.terms,
            }));

            const { data, error } = await supabase
                .from('registrations')
                .insert(inserts)
                .select();

            if (error) throw error;

            // Send one confirmation email per edition (fire-and-forget)
            data.forEach((reg) => {
                supabase.functions.invoke('send-confirmation', {
                    body: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        edition: reg.festival_edition,
                        category: formData.type,
                        registrationId: reg.id,
                    },
                }).catch((err) => console.error('Email error:', err));
            });

            setIsSubmitting(false);
            setSubmitSuccess(true);

            // Reset form after success message
            setTimeout(() => {
                setSubmitSuccess(false);
                handleReset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ submit: `L'inscription a échoué : ${error.message}. Veuillez réessayer.` });
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            type: 'amateur',
            editions: [],
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            organization: '',
            experience: '',
            terms: false
        });
        setErrors({});
        setRegisteredEditions([]);
    };

    const toggleEdition = (value) => {
        setFormData(prev => ({
            ...prev,
            editions: prev.editions.includes(value)
                ? prev.editions.filter(e => e !== value)
                : [...prev.editions, value],
        }));
        if (errors.editions) setErrors(prev => ({ ...prev, editions: '' }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <section id="registration" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            {/* Wave Top */}
            {/* <div className="relative w-full overflow-hidden leading-none -mb-px">
                <svg preserveAspectRatio="none" viewBox="0 0 1200 120" className="w-full h-16 fill-white">
                    <path d="M0,0 C150,90 400,10 600,60 C800,110 1050,10 1200,80 L1200,120 L0,120 Z"></path>
                </svg>
                {/* Wave decorations */}
                {/* <div className="absolute top-0 left-14 w-2 h-2 bg-white rounded-full opacity-60"></div>
                <div className="absolute top-2.5 left-24 w-1.5 h-1.5 bg-white rounded-full opacity-40"></div>
                <div className="absolute top-5 right-16 w-3 h-3 bg-white rounded-full opacity-50"></div>
            </div> */}
            
            {/* Content Card */}
            <div className="bg-deep-navy/40 p-10 md:p-20 text-white rounded-3xl shadow-2xl relative border-l border-r border-b border-white/10">
                <div className="mb-10">
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Inscription Artiste</h2>
                    <p className="text-ice-blue/80 text-lg">Participez au festival en tant qu'artiste amateur ou professionnel</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {submitSuccess ? (
                        <div className="text-center py-12 bg-emerald-900/20 rounded-xl border-2 border-emerald-900">
                            <div className="text-6xl mb-4">✓</div>
                            <h3 className="text-2xl font-bold text-festival-yellow mb-2">Inscription réussie !</h3>
                            <p className="text-ice-blue/80">Vous recevrez un e-mail de confirmation sous peu.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registration Type */}
                            <div>
                                <label className="block text-sm font-semibold text-ice-blue mb-3">Type d'inscription</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="amateur"
                                            checked={formData.type === 'amateur'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                                            formData.type === 'amateur'
                                                ? 'border-festival-yellow bg-festival-yellow/20 font-semibold text-festival-yellow'
                                                : 'border-ice-blue/30 hover:border-ice-blue/50 text-ice-blue/80'
                                        }`}>
                                            Amateur
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="pro"
                                            checked={formData.type === 'pro'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                                            formData.type === 'pro'
                                                ? 'border-festival-yellow bg-festival-yellow/20 font-semibold text-festival-yellow'
                                                : 'border-ice-blue/30 hover:border-ice-blue/50 text-ice-blue/80'
                                        }`}>
                                            Professionnel
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Festival Edition — multiple selection allowed */}
                            <div>
                                <label className="block text-sm font-semibold text-ice-blue mb-1">Édition(s) du festival *</label>
                                <p className="text-xs text-ice-blue/60 mb-3">Vous pouvez vous inscrire à plusieurs éditions.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {EDITIONS.map((ed) => {
                                        const selected = formData.editions.includes(ed.value);
                                        const alreadyDone = registeredEditions.includes(ed.value);
                                        return (
                                            <button
                                                key={ed.value}
                                                type="button"
                                                disabled={alreadyDone}
                                                onClick={() => !alreadyDone && toggleEdition(ed.value)}
                                                className={`flex-1 p-4 border-2 rounded-lg text-center transition-all ${
                                                    alreadyDone
                                                        ? 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                                                        : selected
                                                            ? 'border-festival-yellow bg-festival-yellow/20 text-festival-yellow'
                                                            : 'border-ice-blue/30 hover:border-ice-blue/50 text-ice-blue/80'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm">{ed.label}</div>
                                                <div className="text-xs mt-0.5 opacity-70">{ed.date}</div>
                                                {alreadyDone && <div className="text-xs mt-1 text-white/40">Déjà inscrit(e)</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.editions && <p className="mt-1 text-sm text-red-400">{errors.editions}</p>}
                            </div>

                            {/* Informations personnelles */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-ice-blue mb-2">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.firstName ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-ice-blue mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.lastName ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-ice-blue mb-2">
                                    E-mail *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                        errors.email ? 'border-red-500' : 'border-ice-blue/30'
                                    }`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-ice-blue mb-2">
                                    Numéro de téléphone *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                        errors.phone ? 'border-red-500' : 'border-ice-blue/30'
                                    }`}
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                            </div>

                            {/* Professional Fields */}
                            {formData.type === 'pro' && (
                                <>
                                    <div>
                                        <label htmlFor="organization" className="block text-sm font-semibold text-ice-blue mb-2">
                                            Organisation / Entreprise *
                                        </label>
                                        <input
                                            type="text"
                                            id="organization"
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                                errors.organization ? 'border-red-500' : 'border-ice-blue/30'
                                            }`}
                                        />
                                        {errors.organization && <p className="mt-1 text-sm text-red-400">{errors.organization}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-semibold text-ice-blue mb-2">
                                            Expérience & Qualifications *
                                        </label>
                                        <textarea
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            rows="4"
                                            className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                                errors.experience ? 'border-red-500' : 'border-ice-blue/30'
                                            }`}
                                            placeholder="Décrivez votre expérience en sculpture sur glace/neige..."
                                        />
                                        {errors.experience && <p className="mt-1 text-sm text-red-400">{errors.experience}</p>}
                                    </div>
                                </>
                            )}

                            {/* Terms */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                        className="mt-1 w-5 h-5 accent-festival-yellow"
                                    />
                                    <span className="text-sm text-ice-blue/80">
                                        J'accepte les conditions générales et confirme que toutes les informations fournies sont exactes *
                                    </span>
                                </label>
                                {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms}</p>}
                            </div>

                            {errors.submit && (
                                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-3 border-2 border-ice-blue/30 rounded-lg font-semibold text-ice-blue hover:bg-white/10 transition-colors"
                                >
                                    Réinitialiser
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-festival-yellow text-deep-navy rounded-lg font-bold hover:bg-amber-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Envoi en cours...' : "S'inscrire"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
