import React, { useState, useEffect } from 'react';
import { getRegistrations, deleteRegistration, updateRegistration, exportRegistrationsToCSV } from '../services/registrationService';
import { fetchEditions } from '../services/editionsService';
import { supabase } from '../supabaseClient';

const card = { background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' };
const input = { background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', outline: 'none' };
const labelStyle = { color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

export default function RegistrationManager() {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [editingReg, setEditingReg] = useState(null);
    const [filters, setFilters] = useState({ type: '', search: '', page: 1, pageSize: 20, sortBy: 'created_at', sortOrder: 'desc' });
    const [pagination, setPagination] = useState({ count: 0, totalPages: 0 });

    useEffect(() => { loadRegistrations(); }, [filters]);

    const loadRegistrations = async () => {
        try {
            setIsLoading(true);
            const result = await getRegistrations(filters);
            setRegistrations(result.data);
            setPagination({ count: result.count, totalPages: result.totalPages });
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette inscription ?')) return;
        try { await deleteRegistration(id); loadRegistrations(); }
        catch (e) { alert(e.message); }
    };

    const handleExport = () => {
        const csv = exportRegistrationsToCSV(registrations);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    const ViewModal = ({ registration, onClose }) => {
        if (!registration) return null;
        const Field = ({ label, value }) => (
            <div>
                <p style={labelStyle} className="mb-1">{label}</p>
                <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>{value || '—'}</p>
            </div>
        );
        return (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                                Détails de l'inscription
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined transition-colors"
                                style={{ color: 'var(--color-festival-yellow)', fontSize: '1.25rem' }}>close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <Field label="Type" value={registration.type} />
                            <Field label="ID" value={registration.id} />
                            <Field label="Prénom" value={registration.first_name} />
                            <Field label="Nom" value={registration.last_name} />
                            <Field label="E-mail" value={registration.email} />
                            <Field label="Téléphone" value={registration.phone} />
                            {registration.organization && <Field label="Organisation" value={registration.organization} />}
                            {registration.experience && (
                                <div className="col-span-2">
                                    <p style={labelStyle} className="mb-1">Expérience</p>
                                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>{registration.experience}</p>
                                </div>
                            )}
                            <Field label="Créé le" value={new Date(registration.created_at).toLocaleString()} />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-bold border transition-all"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EditModal = ({ registration, onClose, onSaved }) => {
        const [form, setForm] = useState({
            type: registration.type || 'amateur',
            first_name: registration.first_name || '',
            last_name: registration.last_name || '',
            email: registration.email || '',
            phone: registration.phone || '',
            organization: registration.organization || '',
            experience: registration.experience || '',
        });
        const [saving, setSaving] = useState(false);
        const [emailStatus, setEmailStatus] = useState(null); // null | 'sent' | 'failed' | 'skipped'

        useEffect(() => {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }, []);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setForm(prev => ({ ...prev, [name]: value }));
        };

        const handleSave = async () => {
            setSaving(true);
            setEmailStatus(null);
            try {
                await updateRegistration(registration.id, form);

                const emailChanged = form.email.trim().toLowerCase() !== registration.email.trim().toLowerCase();
                if (emailChanged) {
                    try {
                        const editions = await fetchEditions(true);
                        const editionObj = editions.find(e => e.value === registration.festival_edition);
                        const editionTime = editionObj?.date_iso?.match(/T(\d{2}:\d{2})/)?.[1]?.replace(':', 'h') ?? '';
                        const result = await supabase.functions.invoke('send-confirmation', {
                            body: {
                                name: `${form.first_name} ${form.last_name}`,
                                email: form.email,
                                edition: registration.festival_edition,
                                editionLabel: editionObj?.label ?? registration.festival_edition,
                                editionDate: editionObj?.date_display ?? '',
                                editionTime,
                                category: form.type,
                                registrationId: registration.id,
                            }
                        });
                        setEmailStatus(result?.error ? 'failed' : 'sent');
                    } catch {
                        setEmailStatus('failed');
                    }
                } else {
                    setEmailStatus('skipped');
                }

                onSaved();
                if (emailChanged) {
                    // stay open briefly to show email status
                    setTimeout(onClose, 2000);
                } else {
                    onClose();
                }
            } catch (e) {
                alert('Erreur lors de la sauvegarde : ' + e.message);
            } finally {
                setSaving(false);
            }
        };

        const fieldInput = (label, name, type = 'text') => (
            <div>
                <label className="block mb-1.5" style={labelStyle}>{label}</label>
                <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={input}
                    onFocus={e => e.target.style.borderColor = '#acc9ef'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'}
                />
            </div>
        );

        return (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                                Modifier l'inscription
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined"
                                style={{ color: 'var(--color-festival-yellow)', fontSize: '1.25rem' }}>close</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1.5" style={labelStyle}>Type</label>
                                <select name="type" value={form.type} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg text-sm" style={input}>
                                    <option value="amateur">Amateur</option>
                                    <option value="pro">Professionnel</option>
                                </select>
                            </div>
                            {fieldInput('Prénom', 'first_name')}
                            {fieldInput('Nom', 'last_name')}
                            {fieldInput('E-mail', 'email', 'email')}
                            {fieldInput('Téléphone', 'phone')}
                            {fieldInput('Organisation', 'organization')}
                            <div className="col-span-2">
                                <label className="block mb-1.5" style={labelStyle}>Expérience</label>
                                <textarea
                                    name="experience"
                                    value={form.experience}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                                    style={input}
                                    onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'}
                                />
                            </div>
                        </div>

                        {emailStatus === 'sent' && (
                            <p className="mt-4 text-xs" style={{ color: '#86efac', fontFamily: 'var(--font-family-body)' }}>
                                E-mail de confirmation renvoyé à {form.email}.
                            </p>
                        )}
                        {emailStatus === 'failed' && (
                            <p className="mt-4 text-xs" style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)' }}>
                                Sauvegardé, mais l'envoi de l'e-mail a échoué.
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-bold border"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                style={{ background: 'var(--color-festival-yellow)', color: '#1a1a1a', fontFamily: 'var(--font-family-body)' }}>
                                {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-3xl font-bold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', letterSpacing: '-0.01em' }}>
                    Inscriptions
                </h2>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span className="hidden sm:inline">Exporter CSV</span>
                    </button>
                    <button onClick={loadRegistrations}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span className="hidden sm:inline">Actualiser</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border p-4" style={card}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Rechercher', element: (
                            <input type="text" value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                placeholder="Nom ou e-mail…"
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'} />
                        )},
                        { label: 'Type', element: (
                            <select value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}>
                                <option value="">Tous les types</option>
                                <option value="amateur">Amateur</option>
                                <option value="pro">Professionnel</option>
                            </select>
                        )},
                        { label: 'Trier par', element: (
                            <select value={filters.sortBy}
                                onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}>
                                <option value="created_at">Date</option>
                                <option value="last_name">Nom</option>
                                <option value="email">E-mail</option>
                            </select>
                        )},
                    ].map(f => (
                        <div key={f.label}>
                            <label className="block mb-1.5" style={labelStyle}>{f.label}</label>
                            {f.element}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile cards / Desktop table */}
            {isLoading ? (
                <div className="p-12 text-center flex items-center justify-center gap-2 rounded-xl border"
                    style={{ ...card, color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span> Chargement…
                </div>
            ) : registrations.length === 0 ? (
                <div className="p-12 text-center rounded-xl border" style={{ ...card, color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                    Aucune inscription trouvée
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {registrations.map(reg => (
                            <div key={reg.id} className="rounded-xl border p-4 space-y-3" style={card}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                        {reg.first_name} {reg.last_name}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full shrink-0"
                                        style={reg.type === 'pro'
                                            ? { background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'var(--font-family-body)' }
                                            : { background: 'rgba(252,186,93,0.15)', color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                        {reg.type}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{reg.email}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{reg.phone}</p>
                                    <p className="text-xs" style={{ color: 'rgba(172,201,239,0.5)', fontFamily: 'var(--font-family-body)' }}>
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-1 border-t" style={{ borderColor: 'var(--color-midblue)' }}>
                                    <button onClick={() => setSelectedReg(reg)} className="text-xs font-bold"
                                        style={{ color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>Voir</button>
                                    <button onClick={() => setEditingReg(reg)} className="text-xs font-bold"
                                        style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>Modifier</button>
                                    <button onClick={() => handleDelete(reg.id)} className="text-xs font-bold"
                                        style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)' }}>Supprimer</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block rounded-xl border overflow-hidden" style={card}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-midblue)' }}>
                                        {['Type', 'Nom', 'E-mail', 'Téléphone', 'Date', ''].map(h => (
                                            <th key={h} className={`px-6 py-3 text-left ${h === '' ? 'text-right' : ''}`}
                                                style={{ ...labelStyle, background: '#004075' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((reg, i) => (
                                        <tr key={reg.id}
                                            style={{ borderBottom: i < registrations.length - 1 ? '1px solid var(--color-midblue)' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full"
                                                    style={reg.type === 'pro'
                                                        ? { background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'var(--font-family-body)' }
                                                        : { background: 'rgba(252,186,93,0.15)', color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                                    {reg.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                                {reg.first_name} {reg.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{reg.email}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{reg.phone}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => setSelectedReg(reg)} className="text-xs font-bold transition-colors"
                                                    style={{ color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>Voir</button>
                                                <button onClick={() => setEditingReg(reg)} className="text-xs font-bold transition-colors"
                                                    style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>Modifier</button>
                                                <button onClick={() => handleDelete(reg.id)} className="text-xs font-bold transition-colors"
                                                    style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)' }}>Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-4 flex items-center justify-between rounded-xl border"
                        style={{ borderColor: 'var(--color-midblue)', background: '#004075' }}>
                        <span className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                            {registrations.length} sur {pagination.count} inscriptions
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Précédent
                            </button>
                            <span className="text-xs px-2" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                {filters.page} / {pagination.totalPages}
                            </span>
                            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page >= pagination.totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Suivant
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedReg && <ViewModal registration={selectedReg} onClose={() => setSelectedReg(null)} />}
            {editingReg && (
                <EditModal
                    registration={editingReg}
                    onClose={() => setEditingReg(null)}
                    onSaved={() => { loadRegistrations(); }}
                />
            )}
        </div>
    );
}
