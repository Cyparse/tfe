import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { logError, friendlyError } from '../../utils/errorLogger';
import { useEditions } from '../../hooks/useEditions';

export default function Registration({ inCircle = false }) {
    const { editions: EDITIONS } = useEditions();

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
    const [emailStatus, setEmailStatus] = useState(null); // null | 'sent' | 'failed'
    const debounceTimers = useRef({});

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

            // Send confirmation emails and track status
            const emailResults = await Promise.allSettled(
                data.map((reg) =>
                    supabase.functions.invoke('send-confirmation', {
                        body: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            edition: reg.festival_edition,
                            category: formData.type,
                            registrationId: reg.id,
                        },
                    })
                )
            );
            const emailFailed = emailResults.some(r => r.status === 'rejected' || r.value?.error);
            if (emailFailed) logError('registration:email', new Error('Email confirmation failed'), { editions: newEditions, email: formData.email });
            setEmailStatus(emailFailed ? 'failed' : 'sent');
            setIsSubmitting(false);
            setSubmitSuccess(true);

            // Reset form after success message
            setTimeout(() => {
                setSubmitSuccess(false);
                handleReset();
            }, 8000);

        } catch (error) {
            logError('registration:submit', error, { email: formData.email, editions: formData.editions });
            setErrors({ submit: friendlyError(error) });
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
        setEmailStatus(null);
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'firstName': if (!value.trim()) error = 'Le prénom est requis'; break;
            case 'lastName':  if (!value.trim()) error = 'Le nom est requis'; break;
            case 'email': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) error = "L'e-mail est requis";
                else if (!emailRegex.test(value)) error = "Format d'e-mail invalide";
                break;
            }
            case 'phone': {
                const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                if (!value.trim()) error = 'Le numéro de téléphone est requis';
                else if (!phoneRegex.test(value)) error = 'Numéro de téléphone invalide';
                break;
            }
            case 'organization':
                if (formData.type === 'pro' && !value.trim()) error = "L'organisation est requise pour les professionnels";
                break;
            case 'experience':
                if (formData.type === 'pro' && !value.trim()) error = "Les détails d'expérience sont requis";
                break;
            default: return;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
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
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        const debounceFields = ['firstName', 'lastName', 'email', 'phone', 'organization', 'experience'];
        if (debounceFields.includes(name)) {
            clearTimeout(debounceTimers.current[name]);
            debounceTimers.current[name] = setTimeout(() => validateField(name, finalValue), 600);
        }
    };

    const cInput = { width: "100%", padding: "7px 10px", borderRadius: "7px", border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.28)", color: "#1a2a3a", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
    const cLabel = { fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#2c4a6e", marginBottom: "3px", display: "block" };
    const cErr = { fontSize: "11px", color: "#dc2626", marginTop: "2px" };
    const cField = { marginBottom: "10px" };
    const ci = (hasErr) => hasErr ? { ...cInput, borderColor: "#f87171", background: "rgba(239,68,68,0.08)" } : cInput;

    if (inCircle) {
        return (
            <div>
                <p style={{ fontSize: "19px", fontWeight: 700, color: "#1a3a5c", fontFamily: "'DM Serif Display', serif", marginBottom: "2px", letterSpacing: "-0.01em" }}>
                    Inscription Artiste
                </p>
                <p style={{ fontSize: "12px", color: "#4a6a8c", marginBottom: "14px" }}>
                    Amateur ou professionnel
                </p>

                {submitSuccess ? (
                    <div className="text-center py-10 px-6 bg-white/5 rounded-2xl border border-festival-yellow">
                            <div className="w-12 h-12 rounded-full bg-festival-yellow/15 border border-festival-yellow flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-festival-yellow" style={{ fontSize: '22px', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>check</span>
                        </div>
                        <div className="font-display text-2xl text-deep-navy mb-2">Inscription réussie</div>
                        <div className="text-sm text-deep-navy/60">
                            {emailStatus === 'failed' ? "Votre inscription est bien enregistrée." : "E-mail de confirmation envoyé."}
                        </div>
                        {emailStatus === 'failed' && (
                            <div className="text-xs text-amber-400 mt-3">
                                L'e-mail de confirmation n'a pas pu être envoyé. Contactez l'organisateur si besoin.
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Type */}
                        <div style={cField}>
                            <label style={cLabel}>Type</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {[["amateur", "Amateur"], ["pro", "Professionnel"]].map(([val, lbl]) => (
                                    <label key={val} style={{ flex: 1, cursor: "pointer" }}>
                                        <input type="radio" name="type" value={val} checked={formData.type === val} onChange={handleChange} style={{ display: "none" }} />
                                        <div style={{
                                            padding: "6px 4px",
                                            borderRadius: "7px",
                                            border: `1.5px solid ${formData.type === val ? "rgba(24,72,140,0.65)" : "rgba(255,255,255,0.55)"}`,
                                            background: formData.type === val ? "rgba(24,72,140,0.12)" : "rgba(255,255,255,0.18)",
                                            color: formData.type === val ? "#1a3a5c" : "#4a6a8c",
                                            fontSize: "12px", fontWeight: 600, textAlign: "center", transition: "all 0.15s",
                                        }}>
                                            {lbl}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Editions */}
                        <div style={cField}>
                            <label style={cLabel}>Édition(s) *</label>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent:"flex-start", gap: "5px", width: "100%" }}>
                                {EDITIONS.map(ed => {
                                    const sel = formData.editions.includes(ed.value);
                                    const done = registeredEditions.includes(ed.value);
                                    return (
                                        <button
                                            key={ed.value}
                                            type="button"
                                            disabled={done}
                                            onClick={() => !done && toggleEdition(ed.value)}
                                            style={{
                                                padding: "6px 10px", borderRadius: "7px",
                                                border: `1.5px solid ${done ? "rgba(0,0,0,0.1)" : sel ? "rgba(24,72,140,0.65)" : "rgba(255,255,255,0.55)"}`,
                                                background: done ? "rgba(0,0,0,0.04)" : sel ? "rgba(232, 169, 78,0.8)" : "rgba(255,255,255,0.18)",
                                                color: done ? "#9ab0c4" : sel ? "#1a3a5c" : "#4a6a8c",
                                                fontSize: "12px", fontWeight: 600, cursor: done ? "not-allowed" : "pointer",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                flexDirection: "column", gap: "2px", flex: 1
                                            }}
                                        >
                                            <span>{ed.label}</span>
                                            <span style={{ fontSize: "11px", opacity: 0.7 }}>{done ? "Inscrit(e)" : ed.date_display}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.editions && <p style={cErr}>{errors.editions}</p>}
                        </div>

                        {/* Names */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                            <div>
                                <label style={cLabel}>Prénom *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Marie" style={ci(errors.firstName)} />
                                {errors.firstName && <p style={cErr}>{errors.firstName}</p>}
                            </div>
                            <div>
                                <label style={cLabel}>Nom *</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" style={ci(errors.lastName)} />
                                {errors.lastName && <p style={cErr}>{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div style={cField}>
                            <label style={cLabel}>E-mail *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="marie@exemple.com" style={ci(errors.email)} />
                            {errors.email && <p style={cErr}>{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div style={cField}>
                            <label style={cLabel}>Téléphone *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+32 470 00 00 00" style={ci(errors.phone)} />
                            {errors.phone && <p style={cErr}>{errors.phone}</p>}
                        </div>

                        {/* Pro fields */}
                        {formData.type === "pro" && (
                            <>
                                <div style={cField}>
                                    <label style={cLabel}>Organisation *</label>
                                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="Nom de l'organisation" style={ci(errors.organization)} />
                                    {errors.organization && <p style={cErr}>{errors.organization}</p>}
                                </div>
                                <div style={cField}>
                                    <label style={cLabel}>Expérience *</label>
                                    <textarea name="experience" value={formData.experience} onChange={handleChange} rows={3} placeholder="Décrivez votre expérience..." style={{ ...ci(errors.experience), resize: "vertical" }} />
                                    {errors.experience && <p style={cErr}>{errors.experience}</p>}
                                </div>
                            </>
                        )}

                        {/* Terms */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} style={{ marginTop: "2px", accentColor: "#18488c", flexShrink: 0 }} />
                            <label style={{ fontSize: "11px", color: "#4a6a8c", cursor: "pointer", lineHeight: 1.4 }}>
                                J'accepte les conditions générales *
                            </label>
                        </div>
                        {errors.terms && <p style={cErr}>{errors.terms}</p>}

                        {errors.submit && (
                            <p style={{ ...cErr, padding: "8px", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginTop: "6px" }}>
                                {errors.submit}
                            </p>
                        )}

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{ padding: "8px 14px", borderRadius: "8px", border: "1.5px solid rgba(100,140,180,0.4)", background: "rgba(255,255,255,0.3)", color: "#1a3a5c", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            >
                                Réinitialiser
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: "8px 0", borderRadius: "8px", border: "none", background: isSubmitting ? "rgba(24,72,140,0.5)" : "rgba(24,72,140,0.85)", color: "#fff", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                            >
                                {isSubmitting ? "Envoi..." : "S'inscrire"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div id="registration" className="flex-1 bg-deep-navy/40 p-8 md:p-12 text-white rounded-3xl shadow-2xl border border-white/10">
                <div className="mb-10">
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Inscription Artiste</h2>
                    <p className="text-ice-blue/80 text-lg">Participez au festival en tant qu'artiste amateur ou professionnel</p>
                </div>

                <div className="max-w-md md:max-w-4xl mx-auto">
                    {submitSuccess ? (
                        <div className="text-center py-12 bg-emerald-900/20 rounded-xl border-2 border-emerald-900">
                            <div className="text-6xl mb-4">✓</div>
                            <h3 className="text-2xl font-bold text-festival-yellow mb-2">Inscription réussie !</h3>
                            <p className="text-ice-blue/80">
                                {emailStatus === 'failed' ? "Votre inscription est bien enregistrée." : "Vous recevrez un e-mail de confirmation sous peu."}
                            </p>
                            {emailStatus === 'failed' && (
                                <p className="text-sm text-amber-400 mt-2">
                                    L'e-mail de confirmation n'a pas pu être envoyé. Contactez l'organisateur si besoin.
                                </p>
                            )}
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
                                                <div className="text-xs mt-0.5 opacity-70">{ed.date_display}</div>
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
    );
}
