import React, { useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { logError, friendlyError } from "../../utils/errorLogger";
import { useEditions } from "../../hooks/useEditions";

export default function Tickets({ inCircle = false }) {
  const { editions: EDITIONS } = useEditions();
  const [formData, setFormData] = useState({
    edition: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    ticketCount: 1,
    specialRequests: "",
    newsletter: false,
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'sent' | 'failed'
  const debounceTimers = useRef({});

  const MAX_TICKETS = 10;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'e-mail est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'e-mail invalide";
    }

    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Le code postal est requis";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Le pays est requis";
    }

    if (formData.ticketCount < 1 || formData.ticketCount > MAX_TICKETS) {
      newErrors.ticketCount = `Le nombre de billets doit être entre 1 et ${MAX_TICKETS}`;
    }

    if (!formData.edition) {
      newErrors.edition = "Veuillez sélectionner une édition du festival";
    }

    if (!formData.terms) {
      newErrors.terms = "Vous devez accepter les conditions générales";
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
      // Vérifier le total de billets déjà commandés pour cet email + édition
      const { data: existing } = await supabase
        .from("ticket_orders")
        .select("ticket_count")
        .ilike("email", formData.email)
        .eq("festival_edition", formData.edition);

      const alreadyOrdered = (existing ?? []).reduce((sum, o) => sum + (o.ticket_count || 0), 0);
      const remaining = MAX_TICKETS - alreadyOrdered;

      if (remaining <= 0) {
        setErrors({ submit: `Vous avez déjà atteint la limite de ${MAX_TICKETS} billets pour cette édition avec cette adresse e-mail.` });
        setIsSubmitting(false);
        return;
      }

      if (formData.ticketCount > remaining) {
        setErrors({ submit: `Il vous reste ${remaining} billet${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''} pour cette édition (limite de ${MAX_TICKETS} par adresse e-mail).` });
        setIsSubmitting(false);
        return;
      }

      // Insert ticket order into Supabase (tickets are free)
      const { data, error } = await supabase
        .from("ticket_orders")
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
            terms_accepted: formData.terms,
          },
        ])
        .select();

      if (error) throw error;

      // Send ticket confirmation email and track status
      const selectedEdition = EDITIONS.find((ed) => ed.value === formData.edition);
      const editionTime = selectedEdition?.date_iso?.match(/T(\d{2}:\d{2})/)?.[1]?.replace(":", "h") ?? "";
      const emailResult = await supabase.functions
        .invoke("send-ticket", {
          body: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            edition: formData.edition,
            editionLabel: selectedEdition?.label ?? formData.edition,
            editionDate: selectedEdition?.date_display ?? "",
            editionTime,
            quantity: formData.ticketCount,
            orderId: data[0]?.id ?? "",
          },
        })
        .catch((err) => ({ error: err }));
      const emailFailed = !!emailResult?.error;
      if (emailFailed)
        logError("tickets:email", emailResult.error, {
          email: formData.email,
          edition: formData.edition,
        });
      setEmailStatus(emailFailed ? "failed" : "sent");

      // If newsletter is opted in, add to newsletter subscribers
      if (formData.newsletter) {
        // Use upsert to handle duplicate emails gracefully
        await supabase
          .from("newsletter_subscribers")
          .upsert(
            [
              {
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
              },
            ],
            {
              onConflict: "email",
              ignoreDuplicates: false,
            },
          )
          .select();
        // Ignore errors for newsletter (it's optional and might already exist)
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSubmitSuccess(false);
        handleReset();
      }, 8000);
    } catch (error) {
      logError("tickets:submit", error, {
        email: formData.email,
        edition: formData.edition,
      });
      setErrors({ submit: friendlyError(error) });
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      edition: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      ticketCount: 1,
      specialRequests: "",
      newsletter: false,
      terms: false,
    });
    setErrors({});
    setEmailStatus(null);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "Le prénom est requis";
        break;
      case "lastName":
        if (!value.trim()) error = "Le nom est requis";
        break;
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "L'e-mail est requis";
        else if (!emailRegex.test(value)) error = "Format d'e-mail invalide";
        break;
      }
      case "phone": {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!value.trim()) error = "Le numéro de téléphone est requis";
        else if (!phoneRegex.test(value))
          error = "Numéro de téléphone invalide";
        break;
      }
      case "address":
        if (!value.trim()) error = "L'adresse est requise";
        break;
      case "city":
        if (!value.trim()) error = "La ville est requise";
        break;
      case "postalCode":
        if (!value.trim()) error = "Le code postal est requis";
        break;
      case "country":
        if (!value.trim()) error = "Le pays est requis";
        break;
      default:
        return;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "ticketCount") {
      const numValue = parseInt(value);
      finalValue =
        numValue > MAX_TICKETS ? MAX_TICKETS : numValue < 1 ? 1 : numValue;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    const debounceFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
      "country",
    ];
    if (debounceFields.includes(name)) {
      clearTimeout(debounceTimers.current[name]);
      debounceTimers.current[name] = setTimeout(
        () => validateField(name, finalValue),
        600,
      );
    }
  };

  const cInput = {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "7px",
    border: "1.5px solid rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.28)",
    color: "#1a2a3a",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const cLabel = {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#2c4a6e",
    marginBottom: "3px",
    display: "block",
  };
  const cErr = { fontSize: "11px", color: "#dc2626", marginTop: "2px" };
  const cField = { marginBottom: "10px" };
  const ci = (hasErr) =>
    hasErr
      ? {
          ...cInput,
          borderColor: "#f87171",
          background: "rgba(239,68,68,0.08)",
        }
      : cInput;

  if (inCircle) {
    return (
      <div className="flex flex-col text-right mr-0 ml-auto">
        <p
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: "#1a3a5c",
            fontFamily: "'DM Serif Display', serif",
            marginBottom: "2px",
            letterSpacing: "-0.01em",
          }}
        >
          Vos Billets
        </p>
        <p style={{ fontSize: "12px", color: "#4a6a8c", marginBottom: "14px" }}>
          Gratuit · max {MAX_TICKETS} billets par personne <br /> Pour plus de
          10 billets, contactez-nous à{" "}
          <a
            href="mailto:info@snow-wonder.be"
            style={{ color: "#1a3a5c", textDecoration: "underline" }}
          >
            info@snow-wonder.be
          </a>
        </p>

        {submitSuccess ? (
          <div className="text-center py-10 px-6 bg-white/5 rounded-2xl border border-festival-yellow">
            <div className="w-12 h-12 rounded-full bg-festival-yellow/15 border border-festival-yellow flex items-center justify-center mx-auto mb-4">
              <span
                className="material-symbols-outlined text-festival-yellow"
                style={{
                  fontSize: "22px",
                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                check
              </span>
            </div>
            <div className="font-display text-2xl text-deep-navy mb-2">
              Billets confirmés
            </div>
            <div className="text-sm text-deep-navy/60">
              {emailStatus === "failed"
                ? `${formData.ticketCount} billet${formData.ticketCount > 1 ? "s" : ""} réservé${formData.ticketCount > 1 ? "s" : ""}.`
                : `${formData.ticketCount} billet${formData.ticketCount > 1 ? "s" : ""} envoyés à ${formData.email}`}
            </div>
            {emailStatus === "failed" && (
              <div className="text-xs text-amber-400 mt-3">
                L'e-mail de confirmation n'a pas pu être envoyé. Contactez
                l'organisateur si besoin.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Edition */}
            <div style={cField}>
              <label style={cLabel}>Édition *</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: "5px",
                  width: "100%",
                }}
              >
                {EDITIONS.map((ed) => (
                  <label key={ed.value} style={{ cursor: "pointer", flex: 1 }}>
                    <input
                      type="radio"
                      name="edition"
                      value={ed.value}
                      checked={formData.edition === ed.value}
                      onChange={handleChange}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: "7px",
                        border: `1.5px solid ${formData.edition === ed.value ? "rgba(24,72,140,0.65)" : "rgba(255,255,255,0.55)"}`,
                        background:
                          formData.edition === ed.value
                            ? "rgba(232, 169, 78,0.8)"
                            : "rgba(255,255,255,0.18)",
                        color:
                          formData.edition === ed.value ? "#1a3a5c" : "#4a6a8c",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s",
                        flexDirection: "column",
                        gap: "2px",
                        width: "100%",
                      }}
                    >
                      <span>{ed.label}</span>
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>
                        {ed.date_display}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.edition && <p style={cErr}>{errors.edition}</p>}
            </div>

            {/* Ticket count */}
            <div style={cField}>
              <label style={cLabel}>Nombre de billets *</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="number"
                  name="ticketCount"
                  value={formData.ticketCount}
                  onChange={handleChange}
                  min="1"
                  max={MAX_TICKETS}
                  style={{
                    ...cInput,
                    width: "70px",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                />
                <input
                  type="range"
                  min="1"
                  max={MAX_TICKETS}
                  value={formData.ticketCount}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "ticketCount", value: e.target.value },
                    })
                  }
                  style={{ flex: 1, accentColor: "#18488c" }}
                />
              </div>
              {errors.ticketCount && <p style={cErr}>{errors.ticketCount}</p>}
            </div>

            {/* Names */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label style={cLabel}>Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Marie"
                  style={ci(errors.firstName)}
                  autoComplete="given-name"
                />
                {errors.firstName && <p style={cErr}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={cLabel}>Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  style={ci(errors.lastName)}
                  autoComplete="family-name"
                />
                {errors.lastName && <p style={cErr}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={cField}>
              <label style={cLabel}>E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="marie@exemple.com"
                style={ci(errors.email)}
                autoComplete="email"
              />
              {errors.email && <p style={cErr}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div style={cField}>
              <label style={cLabel}>Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+32 470 00 00 00"
                style={ci(errors.phone)}
                autoComplete="tel"
              />
              {errors.phone && <p style={cErr}>{errors.phone}</p>}
            </div>

            {/* Address */}
            <div style={cField}>
              <label style={cLabel}>Adresse *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rue du Marché 12"
                style={ci(errors.address)}
                autoComplete="street-address"
              />
              {errors.address && <p style={cErr}>{errors.address}</p>}
            </div>

            {/* City / Postal / Country */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 1fr",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label style={cLabel}>Ville *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bruxelles"
                  style={ci(errors.city)}
                  autoComplete="address-level2"
                />
                {errors.city && <p style={cErr}>{errors.city}</p>}
              </div>
              <div>
                <label style={cLabel}>CP *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="1000"
                  style={ci(errors.postalCode)}
                  autoComplete="postal-code"
                />
                {errors.postalCode && <p style={cErr}>{errors.postalCode}</p>}
              </div>
              <div>
                <label style={cLabel}>Pays *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Belgique"
                  style={ci(errors.country)}
                  autoComplete="country-name"
                />
                {errors.country && <p style={cErr}>{errors.country}</p>}
              </div>
            </div>

            {/* Newsletter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                style={{ accentColor: "#18488c", flexShrink: 0 }}
              />
              <label
                style={{
                  fontSize: "11px",
                  color: "#4a6a8c",
                  cursor: "pointer",
                }}
              >
                S'abonner à la newsletter
              </label>
            </div>

            {/* Terms */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                style={{
                  marginTop: "2px",
                  accentColor: "#18488c",
                  flexShrink: 0,
                }}
              />
              <label
                style={{
                  fontSize: "11px",
                  color: "#4a6a8c",
                  cursor: "pointer",
                  lineHeight: 1.4,
                }}
              >
                J'accepte les conditions générales et la politique de
                confidentialité *
              </label>
            </div>
            {errors.terms && <p style={cErr}>{errors.terms}</p>}

            {errors.submit && (
              <p
                style={{
                  ...cErr,
                  padding: "8px",
                  background: "rgba(239,68,68,0.08)",
                  borderRadius: "6px",
                  marginTop: "6px",
                }}
              >
                {errors.submit}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid rgba(100,140,180,0.4)",
                  background: "rgba(255,255,255,0.3)",
                  color: "#1a3a5c",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Réinitialiser
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: "8px",
                  border: "none",
                  background: isSubmitting
                    ? "rgba(24,72,140,0.5)"
                    : "rgba(24,72,140,0.85)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {isSubmitting
                  ? "Traitement..."
                  : `Obtenir ${formData.ticketCount} billet${formData.ticketCount > 1 ? "s" : ""}`}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div
      id="tickets"
      className="flex-1 bg-deep-navy/40 p-8 md:p-12 text-white rounded-3xl shadow-2xl border border-white/10"
    >
      <div className="mb-10">
        <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">
          Vos Billets
        </h2>
        <p className="text-ice-blue/80 text-lg">
          Entrée gratuite ! Limité à {MAX_TICKETS} billets par personne
        </p>
      </div>

      <div className="max-w-md md:max-w-4xl mx-auto">
        {submitSuccess ? (
          <div className="text-center py-10 px-6 bg-white/5 rounded-2xl border border-festival-yellow">
            <div className="w-12 h-12 rounded-full bg-festival-yellow/15 border border-festival-yellow flex items-center justify-center mx-auto mb-4">
              <span
                className="material-symbols-outlined text-festival-yellow"
                style={{
                  fontSize: "22px",
                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                check
              </span>
            </div>
            <h3 className="font-display text-3xl text-deep-navy mb-3">
              Billets confirmés
            </h3>
            <p className="text-ice-blue/80 mb-2">
              Vos {formData.ticketCount} billet
              {formData.ticketCount > 1 ? "s" : ""} gratuit
              {formData.ticketCount > 1 ? "s" : ""} ont été réservés.
            </p>
            {emailStatus === "failed" ? (
              <p className="text-sm text-amber-400 mt-3">
                L'e-mail de confirmation n'a pas pu être envoyé. Contactez
                l'organisateur si besoin.
              </p>
            ) : (
              <p className="text-sm text-ice-blue/50 mt-1">
                E-mail de confirmation envoyé à {formData.email}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Festival Edition */}
            <div>
              <label className="block text-sm font-semibold text-ice-blue mb-3">
                Édition du festival *
              </label>
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
                    <div
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.edition === ed.value
                          ? "border-festival-yellow bg-festival-yellow/20 font-semibold text-festival-yellow"
                          : "border-ice-blue/30 hover:border-ice-blue/50 text-ice-blue/80"
                      }`}
                    >
                      <div className="font-semibold text-sm">{ed.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{ed.date_display}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.edition && (
                <p className="mt-1 text-sm text-red-400">{errors.edition}</p>
              )}
            </div>

            {/* Ticket Count */}
            <div className="bg-festival-yellow/20 p-6 rounded-xl border-2 border-festival-yellow/50">
              <label
                htmlFor="ticketCount"
                className="block text-lg font-bold text-festival-yellow mb-3"
              >
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
                    errors.ticketCount
                      ? "border-red-500"
                      : "border-festival-yellow/50"
                  }`}
                />
                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max={MAX_TICKETS}
                    value={formData.ticketCount}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "ticketCount", value: e.target.value },
                      })
                    }
                    className="w-full accent-festival-yellow"
                  />
                  <div className="flex justify-between text-xs text-ice-blue/60 mt-1">
                    <span>1</span>
                    <span>{MAX_TICKETS} max</span>
                  </div>
                </div>
              </div>
              {errors.ticketCount && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.ticketCount}
                </p>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.firstName ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.lastName ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.email ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.phone ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-ice-blue mb-2"
              >
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
                  errors.address ? "border-red-500" : "border-ice-blue/30"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address}</p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.city ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.postalCode ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.postalCode}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-semibold text-ice-blue mb-2"
                >
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
                    errors.country ? "border-red-500" : "border-ice-blue/30"
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-400">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label
                htmlFor="specialRequests"
                className="block text-sm font-semibold text-ice-blue mb-2"
              >
                Demandes particulières (Optionnel)
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="3"
                maxLength={1000}
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
                  S'abonner à la newsletter pour recevoir les actualités et
                  offres spéciales
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
                  J'accepte les conditions générales et la politique de
                  confidentialité. Je comprends que la disponibilité des billets
                  est soumise à confirmation. *
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-400">{errors.terms}</p>
              )}
            </div>

            {/* Security Note */}
            <div className="bg-emerald-900/20 border border-emerald-900 rounded-lg p-4 flex items-start gap-3">
              <div className="text-sm text-emerald-500">
                <strong>Formulaire sécurisé :</strong> Vos données personnelles
                sont chiffrées et protégées. Nous ne partagerons jamais vos
                données avec des tiers.
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
                {isSubmitting
                  ? "Traitement en cours..."
                  : `Obtenir ${formData.ticketCount} billet${formData.ticketCount > 1 ? "s" : ""} gratuit${formData.ticketCount > 1 ? "s" : ""}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
