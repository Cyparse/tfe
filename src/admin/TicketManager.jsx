import React, { useState, useEffect } from 'react';
import { getTicketOrders, deleteTicketOrder, exportTicketOrdersToCSV } from '../services/ticketService';

const card = { background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' };
const input = { background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)', outline: 'none' };
const labelStyle = { color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

export default function TicketManager() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
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

    const handleExport = () => {
        const csv = exportTicketOrdersToCSV(orders);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ticket_orders_${new Date().toISOString().split('T')[0]}.csv`; a.click();
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

            {/* Table */}
            <div className="rounded-xl border overflow-hidden" style={card}>
                {isLoading ? (
                    <div className="p-12 text-center flex items-center justify-center gap-2"
                        style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span> Chargement…
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>Aucune commande trouvée</div>
                ) : (
                    <>
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
                                                <button onClick={() => handleDelete(order.id)}
                                                    className="text-xs font-bold" style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)' }}>Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 flex items-center justify-between border-t"
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
            </div>

            {selectedOrder && <ViewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
}