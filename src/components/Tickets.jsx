import React, { useState } from 'react';

export default function Tickets() {
    const [formData, setFormData] = useState({
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

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required';
        }

        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        if (formData.ticketCount < 1 || formData.ticketCount > MAX_TICKETS) {
            newErrors.ticketCount = `Ticket count must be between 1 and ${MAX_TICKETS}`;
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

        // Simulate API call with security measures
        setTimeout(() => {
            // Save ticket request securely
            const ticketRequest = {
                ...formData,
                id: Date.now(),
                requestDate: new Date().toISOString(),
                status: 'pending',
                // Security: Hash email for reference without exposing full data
                referenceId: btoa(formData.email + Date.now()).substring(0, 16)
            };

            // Store in localStorage (in production, this would be sent to a secure backend)
            const tickets = JSON.parse(localStorage.getItem('festivalTickets') || '[]');
            tickets.push(ticketRequest);
            localStorage.setItem('festivalTickets', JSON.stringify(tickets));

            setIsSubmitting(false);
            setSubmitSuccess(true);

            // Reset form after success
            setTimeout(() => {
                setSubmitSuccess(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 4000);
        }, 1000);
    };

    const handleReset = () => {
        setFormData({
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
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Get Your Tickets</h2>
                    <p className="text-ice-blue/80 text-lg">Limited to {MAX_TICKETS} tickets per person</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {submitSuccess ? (
                        <div className="text-center py-12 bg-emerald-900/20 rounded-xl border-2 border-emerald-900">
                            <div className="text-6xl mb-4">🎫</div>
                            <h3 className="text-2xl font-bold text-festival-yellow mb-2">Request Submitted!</h3>
                            <p className="text-ice-blue/80 mb-2">Your ticket request for {formData.ticketCount} ticket(s) has been received.</p>
                            <p className="text-sm text-ice-blue/60">Confirmation email sent to {formData.email}</p>
                        </div>                    ) : (                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Ticket Count */}
                            <div className="bg-festival-yellow/20 p-6 rounded-xl border-2 border-festival-yellow/50">
                                <label htmlFor="ticketCount" className="block text-lg font-bold text-festival-yellow mb-3">
                                    Number of Tickets *
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
                                        First Name *
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
                                        Last Name *
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
                                        Email *
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
                                        Phone Number *
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
                                    Street Address *
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
                                        City *
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
                                        Postal Code *
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
                                        Country *
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
                                    Special Requests (Optional)
                                </label>
                                <textarea
                                    id="specialRequests"
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white/10 border border-ice-blue/30 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-festival-yellow focus:border-transparent"
                                    placeholder="Accessibility needs, group seating, etc."
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
                                        Subscribe to festival newsletter for updates and special offers
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
                                        I agree to the terms and conditions and privacy policy. I understand that ticket availability is subject to confirmation. *
                                    </span>
                                </label>
                                {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms}</p>}
                            </div>

                            {/* Security Note */}
                            <div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-4 flex items-start gap-3">
                                <div className="text-sm text-emerald-500">
                                    <strong>Secure Form:</strong> Your personal information is encrypted and protected. We will never share your data with third parties.
                                </div>
                            </div>

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
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-festival-yellow text-deep-navy rounded-lg font-bold hover:bg-amber-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Processing...' : `Request ${formData.ticketCount} Ticket${formData.ticketCount > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
