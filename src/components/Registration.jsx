import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Registration() {
const EDITIONS = [
    { value: 'december', label: 'Édition Décembre', date: '6 déc. 2026' },
    { value: 'january',  label: 'Édition Janvier',  date: '10 jan. 2027' },
    { value: 'february', label: 'Édition Février',  date: '7 fév. 2027' },
];

    const [formData, setFormData] = useState({
        type: 'amateur', // 'amateur' or 'pro'
        edition: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '', // For pro registrations
        experience: '', // For pro registrations
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    useEffect(() => {
        // Check if user already registered
        const checkRegistration = async () => {
            if (formData.email && formData.email.includes('@')) {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('email')
                    .ilike('email', formData.email)
                    .limit(1);
                
                if (!error && data && data.length > 0) {
                    setAlreadyRegistered(true);
                } else {
                    setAlreadyRegistered(false);
                }
            }
        };
        
        const timeoutId = setTimeout(checkRegistration, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.email]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        if (formData.type === 'pro') {
            if (!formData.organization.trim()) {
                newErrors.organization = 'Organization is required for professionals';
            }
            if (!formData.experience.trim()) {
                newErrors.experience = 'Experience details are required';
            }
        }

        if (!formData.edition) {
            newErrors.edition = 'Please select a festival edition';
        }

        if (!formData.terms) {
            newErrors.terms = 'You must accept the terms and conditions';
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
            // Check for double registration
            const { data: existingRegistrations, error: checkError } = await supabase
                .from('registrations')
                .select('email')
                .ilike('email', formData.email)
                .limit(1);
            
            if (checkError) throw checkError;
            
            if (existingRegistrations && existingRegistrations.length > 0) {
                setErrors({ submit: 'This email is already registered. No double registration allowed.' });
                setIsSubmitting(false);
                return;
            }

            // Insert registration into Supabase
            const { data, error } = await supabase
                .from('registrations')
                .insert([
                    {
                        type: formData.type,
                        festival_edition: formData.edition,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        organization: formData.organization || null,
                        experience: formData.experience || null,
                        terms_accepted: formData.terms
                    }
                ])
                .select();

            if (error) throw error;

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
            setErrors({ submit: `Registration failed: ${error.message}. Please try again.` });
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            type: 'amateur',
            edition: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            organization: '',
            experience: '',
            terms: false
        });
        setErrors({});
        setAlreadyRegistered(false);
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

                            {/* Festival Edition */}
                            <div>
                                <label className="block text-sm font-semibold text-ice-blue mb-3">Édition du festival *</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {EDITIONS.map((ed) => (
                                        <label key={ed.value} className="flex-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="edition"
                                                value={ed.value}
                                                checked={formData.edition === ed.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                                                formData.edition === ed.value
                                                    ? 'border-festival-yellow bg-festival-yellow/20 font-semibold text-festival-yellow'
                                                    : 'border-ice-blue/30 hover:border-ice-blue/50 text-ice-blue/80'
                                            }`}>
                                                <div className="font-semibold text-sm">{ed.label}</div>
                                                <div className="text-xs mt-0.5 opacity-70">{ed.date}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.edition && <p className="mt-1 text-sm text-red-400">{errors.edition}</p>}
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
                                        errors.email || alreadyRegistered ? 'border-red-500' : 'border-ice-blue/30'
                                    }`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                {alreadyRegistered && !errors.email && (
                                    <p className="mt-1 text-sm text-red-400">This email is already registered</p>
                                )}
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
                                            Experience & Qualifications *
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
                                            placeholder="Please describe your experience in ice/snow sculpting..."
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
                                        I accept the terms and conditions and confirm that all information provided is accurate *
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
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || alreadyRegistered}
                                    className="flex-1 px-6 py-3 bg-festival-yellow text-deep-navy rounded-lg font-bold hover:bg-amber-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Register Now'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
