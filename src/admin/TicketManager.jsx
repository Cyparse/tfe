import React, { useState, useEffect } from 'react';
import { getTicketOrders, getAllTicketOrders, deleteTicketOrder, updateTicketOrder, exportTicketOrdersToCSV } from '../services/ticketService';
import { fetchEditions } from '../services/editionsService';
import { supabase } from '../supabaseClient';

const card = { background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' };
const input = { background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', outline: 'none' };
const labelStyle = { color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

export default function TicketManager() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [filters, setFilters] = useState({ search: '', page: 1, pageSize: 20, sortBy: 'created_at', sortOrder: 'desc' });
    const [pagination, setPagination] = useState({ count: 0, totalPages: 0 });

    useEffect(() => { loadOrders(); }, [filters]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const result = await getTicketOrders(filters);
            setOrders(result.data);
            setPagination({ count: result.count, totalPages: result.totalPages });
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette commande de billets ?')) return;
        try { await deleteTicketOrder(id); loadOrders(); }
        catch (e) { alert(e.message); }
    };

    const handleExport = async () => {
        try {
            const all = await getAllTicketOrders();
            const csv = exportTicketOrdersToCSV(all);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `ticket_orders_${new Date().toISOString().split('T')[0]}.csv`; a.click();
        } catch (e) { alert('Erreur export : ' + e.message); }
    };

    const ViewModal = ({ order, onClose }) => {
        useEffect(() => {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }, []);
        if (!order) return null;
        const Field = ({ label, value }) => (
            <div>
                <p style={labelStyle} className="mb-1">{label}</p>
                <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>{value ?? '—'}</p>
            </div>
        );
        return (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                                Détails de la commande
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined" style={{ color: 'var(--color-festival-yellow)' }}>close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <Field label="ID commande" value={order.id} />
                            <Field label="Nombre de billets" value={order.ticket_count} />
                            <Field label="Prénom" value={order.first_name} />
                            <Field label="Nom" value={order.last_name} />
                            <Field label="E-mail" value={order.email} />
                            <Field label="Téléphone" value={order.phone} />
                            <div className="col-span-2"><Field label="Adresse" value={order.address} /></div>
                            <Field label="Ville" value={order.city} />
                            <Field label="Code postal" value={order.postal_code} />
                            <Field label="Pays" value={order.country} />
                            <Field label="Newsletter" value={order.newsletter_opt_in ? 'Oui' : 'Non'} />
                            {order.special_requests && (
                                <div className="col-span-2">
                                    <p style={labelStyle} className="mb-1">Demandes spéciales</p>
                                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                        {order.special_requests}
                                    </p>
                                </div>
                            )}
                            <Field label="Créé le" value={new Date(order.created_at).toLocaleString()} />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-bold border"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EditModal = ({ order, onClose, onSaved }) => {
        const [form, setForm] = useState({
            first_name: order.first_name || '',
            last_name: order.last_name || '',
            email: order.email || '',
            phone: order.phone || '',
            address: order.address || '',
            city: order.city || '',
            postal_code: order.postal_code || '',
            country: order.country || '',
            ticket_count: order.ticket_count ?? 1,
            special_requests: order.special_requests || '',
            newsletter_opt_in: order.newsletter_opt_in ?? false,
        });
        const [saving, setSaving] = useState(false);
        const [emailStatus, setEmailStatus] = useState(null); // null | 'sent' | 'failed'

        useEffect(() => {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }, []);

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };

        const handleSave = async () => {
            setSaving(true);
            setEmailStatus(null);
            try {
                const { ticket_count, ...updatableFields } = form;
                await updateTicketOrder(order.id, updatableFields);

                const emailChanged = form.email.trim().toLowerCase() !== order.email.trim().toLowerCase();
                if (emailChanged) {
                    try {
                        const editions = await fetchEditions(true);
                        const editionObj = editions.find(e => e.value === order.festival_edition);
                        const editionTime = editionObj?.date_iso?.match(/T(\d{2}:\d{2})/)?.[1]?.replace(':', 'h') ?? '';
                        const result = await supabase.functions.invoke('send-ticket', {
                            body: {
                                name: `${form.first_name} ${form.last_name}`,
                                email: form.email,
                                edition: order.festival_edition,
                                editionLabel: editionObj?.label ?? order.festival_edition,
                                editionDate: editionObj?.date_display ?? '',
                                editionTime,
                                quantity: Number(form.ticket_count),
                                orderId: order.id,
                            }
                        });
                        setEmailStatus(result?.error ? 'failed' : 'sent');
                    } catch {
                        setEmailStatus('failed');
                    }
                }

                onSaved();
                if (emailChanged) {
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
                                Modifier la commande
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined"
                                style={{ color: 'var(--color-festival-yellow)', fontSize: '1.25rem' }}>close</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {fieldInput('Prénom', 'first_name')}
                            {fieldInput('Nom', 'last_name')}
                            {fieldInput('E-mail', 'email', 'email')}
                            {fieldInput('Téléphone', 'phone')}
                            <div className="col-span-2">{fieldInput('Adresse', 'address')}</div>
                            {fieldInput('Ville', 'city')}
                            {fieldInput('Code postal', 'postal_code')}
                            {fieldInput('Pays', 'country')}
                            <div>
                                <label className="block mb-1.5" style={labelStyle}>Nombre de billets</label>
                                <p className="w-full px-3 py-2 rounded-lg text-sm" style={{ ...input, border: '1px solid rgba(58,124,165,0.3)', opacity: 0.6, cursor: 'not-allowed' }}>
                                    {form.ticket_count}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-5">
                                <input
                                    type="checkbox"
                                    name="newsletter_opt_in"
                                    id="newsletter_opt_in"
                                    checked={form.newsletter_opt_in}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="newsletter_opt_in" style={{ ...labelStyle, cursor: 'pointer' }}>Newsletter</label>
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1.5" style={labelStyle}>Demandes spéciales</label>
                                <textarea
                                    name="special_requests"
                                    value={form.special_requests}
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
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-3xl font-bold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', letterSpacing: '-0.01em' }}>
                    Billetterie
                </h2>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span className="hidden sm:inline">Exporter CSV</span>
                    </button>
                    <button onClick={loadOrders}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        <span className="hidden sm:inline">Actualiser</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border p-4" style={card}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: 'Rechercher', element: (
                            <input type="text" value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                placeholder="Nom ou e-mail…" className="w-full px-3 py-2 rounded-lg text-sm" style={input}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-midblue)'} />
                        )},
                        { label: 'Trier par', element: (
                            <select value={filters.sortBy}
                                onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm" style={input}>
                                <option value="created_at">Date</option>
                                <option value="last_name">Nom</option>
                                <option value="ticket_count">Nombre de billets</option>
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
            ) : orders.length === 0 ? (
                <div className="p-12 text-center rounded-xl border" style={{ ...card, color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                    Aucune commande trouvée
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {orders.map(order => (
                            <div key={order.id} className="rounded-xl border p-4 space-y-3" style={card}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                        {order.first_name} {order.last_name}
                                    </span>
                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full shrink-0"
                                        style={{ background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>
                                        {order.ticket_count} billet{order.ticket_count > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{order.email}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{order.city}, {order.country}</p>
                                    <p className="text-xs" style={{ color: 'rgba(172,201,239,0.5)', fontFamily: 'var(--font-family-body)' }}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-1 border-t" style={{ borderColor: 'var(--color-midblue)' }}>
                                    <button onClick={() => setSelectedOrder(order)} className="text-xs font-bold"
                                        style={{ color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>Voir</button>
                                    <button onClick={() => setEditingOrder(order)} className="text-xs font-bold"
                                        style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>Modifier</button>
                                    <button onClick={() => handleDelete(order.id)} className="text-xs font-bold"
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
                                        {['Nom', 'E-mail', 'Localisation', 'Billets', 'Date', ''].map(h => (
                                            <th key={h} className={`px-6 py-3 text-left ${h === '' ? 'text-right' : ''}`}
                                                style={{ ...labelStyle, background: '#004075' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={order.id}
                                            style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--color-midblue)' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                                {order.first_name} {order.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{order.email}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                                {order.city}, {order.country}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full"
                                                    style={{ background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>
                                                    {order.ticket_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => setSelectedOrder(order)}
                                                    className="text-xs font-bold" style={{ color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>Voir</button>
                                                <button onClick={() => setEditingOrder(order)}
                                                    className="text-xs font-bold" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>Modifier</button>
                                                <button onClick={() => handleDelete(order.id)}
                                                    className="text-xs font-bold" style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)' }}>Supprimer</button>
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
                            {orders.length} sur {pagination.count} commandes
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-30"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Précédent
                            </button>
                            <span className="text-xs px-2" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                {filters.page} / {pagination.totalPages}
                            </span>
                            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page >= pagination.totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-30"
                                style={{ border: '1px solid var(--color-midblue)', color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)' }}>
                                Suivant
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedOrder && <ViewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            {editingOrder && (
                <EditModal
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSaved={() => { loadOrders(); }}
                />
            )}
        </div>
    );
}
