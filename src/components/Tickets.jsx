import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const EDITIONS = [
    { value: 'december', label: 'December Edition', date: 'Dec 6, 2026' },
    { value: 'january',  label: 'January Edition',  date: 'Jan 10, 2027' },
    { value: 'february', label: 'February Edition', date: 'Feb 7, 2027' },
];

export default function Tickets() {
    const [formData, setFormData] = useState({
        edition: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        ticketCount: 1,
        specialRequests: '',
        newsletter: false,
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const MAX_TICKETS = 10;

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

        if (!formData.address.trim()) {
            newErrors.address = "L'adresse est requise";
        }

        if (!formData.city.trim()) {
            newErrors.city = 'La ville est requise';
        }

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Le code postal est requis';
        }

        if (!formData.country.trim()) {
            newErrors.country = 'Le pays est requis';
        }

        if (formData.ticketCount < 1 || formData.ticketCount > MAX_TICKETS) {
            newErrors.ticketCount = `Le nombre de billets doit être entre 1 et ${MAX_TICKETS}`;
        }

        if (!formData.edition) {
            newErrors.edition = 'Veuillez sélectionner une édition du festival';
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
            // Insert ticket order into Supabase (tickets are free)
            const { data, error } = await supabase
                .from('ticket_orders')
                .insert([
                    {
                        festival_edition: formData.edition,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        postal_code: formData.postalCode,
                        country: formData.country,
                        ticket_count: formData.ticketCount,
                        special_requests: formData.specialRequests || null,
                        newsletter_opt_in: formData.newsletter,
                        terms_accepted: formData.terms
                    }
                ])
                .select();

            if (error) throw error;

            // If newsletter is opted in, add to newsletter subscribers
            if (formData.newsletter) {
                // Use upsert to handle duplicate emails gracefully
                await supabase
                    .from('newsletter_subscribers')
                    .upsert([
                        {
                            email: formData.email,
                            first_name: formData.firstName,
                            last_name: formData.lastName
                        }
                    ], {
                        onConflict: 'email',
                        ignoreDuplicates: false
                    })
                    .select();
                // Ignore errors for newsletter (it's optional and might already exist)
            }

            setIsSubmitting(false);
            setSubmitSuccess(true);

            // Reset form after success
            setTimeout(() => {
                setSubmitSuccess(false);
                handleReset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 4000);

        } catch (error) {
            console.error('Ticket order error:', error);
            setErrors({ submit: `La commande a échoué : ${error.message}. Veuillez réessayer.` });
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            edition: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
            ticketCount: 1,
            specialRequests: '',
            newsletter: false,
            terms: false
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        // Additional validation for ticket count
        if (name === 'ticketCount') {
            const numValue = parseInt(value);
            if (numValue > MAX_TICKETS) {
                finalValue = MAX_TICKETS;
            } else if (numValue < 1) {
                finalValue = 1;
            } else {
                finalValue = numValue;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <section id="tickets" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
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
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Vos Billets</h2>
                    <p className="text-ice-blue/80 text-lg">Entrée gratuite ! Limité à {MAX_TICKETS} billets par personne</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {submitSuccess ? (
                        <div className="text-center py-12 bg-emerald-900/20 rounded-xl border-2 border-emerald-900">
                            <div className="text-6xl mb-4">🎫</div>
                            <h3 className="text-2xl font-bold text-festival-yellow mb-2">Billets confirmés !</h3>
                            <p className="text-ice-blue/80 mb-2">Vos {formData.ticketCount} billet{formData.ticketCount > 1 ? 's' : ''} gratuit{formData.ticketCount > 1 ? 's' : ''} ont été confirmés.</p>
                            <p className="text-sm text-ice-blue/60">E-mail de confirmation envoyé à {formData.email}</p>
                        </div>                    ) : (                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            {/* Ticket Count */}
                            <div className="bg-festival-yellow/20 p-6 rounded-xl border-2 border-festival-yellow/50">
                                <label htmlFor="ticketCount" className="block text-lg font-bold text-festival-yellow mb-3">
                                    Nombre de billets *
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        id="ticketCount"
                                        name="ticketCount"
                                        value={formData.ticketCount}
                                        onChange={handleChange}
                                        min="1"
                                        max={MAX_TICKETS}
                                        className={`w-32 px-4 py-3 text-2xl font-bold border-2 rounded-lg text-center bg-white/10 text-white focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.ticketCount ? 'border-red-500' : 'border-festival-yellow/50'
                                        }`}
                                    />
                                    <div className="flex-1">
                                        <input
                                            type="range"
                                            min="1"
                                            max={MAX_TICKETS}
                                            value={formData.ticketCount}
                                            onChange={(e) => handleChange({ target: { name: 'ticketCount', value: e.target.value } })}
                                            className="w-full accent-festival-yellow"
                                        />
                                        <div className="flex justify-between text-xs text-ice-blue/60 mt-1">
                                            <span>1</span>
                                            <span>{MAX_TICKETS} max</span>
                                        </div>
                                    </div>
                                </div>
                                {errors.ticketCount && <p className="mt-2 text-sm text-red-400">{errors.ticketCount}</p>}
                            </div>

                            {/* Personal Information */}
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
                                        autoComplete="given-name"
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
                                        autoComplete="family-name"
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.lastName ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
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
                                        autoComplete="email"
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
                                        autoComplete="tel"
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.phone ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-semibold text-ice-blue mb-2">
                                    Adresse *
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                        errors.address ? 'border-red-500' : 'border-ice-blue/30'
                                    }`}
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address}</p>}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-ice-blue mb-2">
                                        Ville *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        autoComplete="address-level2"
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.city ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-semibold text-ice-blue mb-2">
                                        Code postal *
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        autoComplete="postal-code"
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.postalCode ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.postalCode && <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>}
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-semibold text-ice-blue mb-2">
                                        Pays *
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        autoComplete="country-name"
                                        className={`w-full px-4 py-2 bg-white/10 border text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent ${
                                            errors.country ? 'border-red-500' : 'border-ice-blue/30'
                                        }`}
                                    />
                                    {errors.country && <p className="mt-1 text-sm text-red-400">{errors.country}</p>}
                                </div>
                            </div>

                            {/* Special Requests */}
                            <div>
                                <label htmlFor="specialRequests" className="block text-sm font-semibold text-ice-blue mb-2">
                                    Demandes particulières (Optionnel)
                                </label>
                                <textarea
                                    id="specialRequests"
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white/10 border border-ice-blue/30 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent"
                                    placeholder="Besoins d'accessibilité, groupes, etc."
                                />
                            </div>

                            {/* Newsletter */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                        className="w-5 h-5 accent-festival-yellow"
                                    />
                                    <span className="text-sm text-ice-blue/80">
                                        S'abonner à la newsletter pour recevoir les actualités et offres spéciales
                                    </span>
                                </label>
                            </div>

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
                                        J'accepte les conditions générales et la politique de confidentialité. Je comprends que la disponibilité des billets est soumise à confirmation. *
                                    </span>
                                </label>
                                {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms}</p>}
                            </div>

                            {/* Security Note */}
                            <div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-4 flex items-start gap-3">
                                <div className="text-sm text-emerald-500">
                                    <strong>Formulaire sécurisé :</strong> Vos données personnelles sont chiffrées et protégées. Nous ne partagerons jamais vos données avec des tiers.
                                </div>
                            </div>

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
                                    {isSubmitting ? 'Traitement en cours...' : `Obtenir ${formData.ticketCount} billet${formData.ticketCount > 1 ? 's' : ''} gratuit${formData.ticketCount > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
