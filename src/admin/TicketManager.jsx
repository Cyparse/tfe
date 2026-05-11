import React, { useState, useEffect } from 'react';
import { getTicketOrders, deleteTicketOrder, exportTicketOrdersToCSV } from '../services/ticketService';

const card = { background: '#1e2020', borderColor: '#333535' };
const input = { background: '#282a2b', border: '1px solid #43474d', color: '#e2e2e2', fontFamily: 'Nunito Sans', outline: 'none' };
const labelStyle = { color: '#c3c6ce', fontFamily: 'Nunito Sans', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

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
        if (!confirm('Delete this ticket order?')) return;
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
        if (!order) return null;
        const Field = ({ label, value }) => (
            <div>
                <p style={labelStyle} className="mb-1">{label}</p>
                <p className="text-sm" style={{ color: '#e2e2e2', fontFamily: 'Nunito Sans' }}>{value ?? '—'}</p>
            </div>
        );
        return (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: '#1e2020', borderColor: '#333535' }}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold" style={{ color: '#e2e2e2', fontFamily: 'Rubik' }}>
                                Ticket Order Details
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined" style={{ color: '#8d9198' }}>close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <Field label="Order ID" value={order.id} />
                            <Field label="Ticket Count" value={order.ticket_count} />
                            <Field label="First Name" value={order.first_name} />
                            <Field label="Last Name" value={order.last_name} />
                            <Field label="Email" value={order.email} />
                            <Field label="Phone" value={order.phone} />
                            <div className="col-span-2"><Field label="Address" value={order.address} /></div>
                            <Field label="City" value={order.city} />
                            <Field label="Postal Code" value={order.postal_code} />
                            <Field label="Country" value={order.country} />
                            <Field label="Newsletter" value={order.newsletter ? 'Yes' : 'No'} />
                            {order.special_requests && (
                                <div className="col-span-2">
                                    <p style={labelStyle} className="mb-1">Special Requests</p>
                                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#e2e2e2', fontFamily: 'Nunito Sans' }}>
                                        {order.special_requests}
                                    </p>
                                </div>
                            )}
                            <Field label="Created At" value={new Date(order.created_at).toLocaleString()} />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-bold border"
                                style={{ border: '1px solid #43474d', color: '#c3c6ce', fontFamily: 'Nunito Sans' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold" style={{ color: '#e2e2e2', fontFamily: 'Rubik', letterSpacing: '-0.01em' }}>
                    Ticketing
                </h2>
                <div className="flex gap-3">
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#282a2b', border: '1px solid #43474d', color: '#e2e2e2', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export CSV
                    </button>
                    <button onClick={loadOrders}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#282a2b', border: '1px solid #43474d', color: '#e2e2e2', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border p-4" style={card}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: 'Search', element: (
                            <input type="text" value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                placeholder="Name or email…" className="w-full px-3 py-2 rounded-lg text-sm" style={input}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = '#43474d'} />
                        )},
                        { label: 'Sort By', element: (
                            <select value={filters.sortBy}
                                onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm" style={input}>
                                <option value="created_at">Date</option>
                                <option value="last_name">Last Name</option>
                                <option value="ticket_count">Ticket Count</option>
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
                        style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span> Loading…
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>No ticket orders found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333535' }}>
                                        {['Name', 'Email', 'Location', 'Tickets', 'Date', ''].map(h => (
                                            <th key={h} className={`px-6 py-3 text-left ${h === '' ? 'text-right' : ''}`}
                                                style={{ ...labelStyle, background: '#282a2b' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={order.id}
                                            style={{ borderBottom: i < orders.length - 1 ? '1px solid #333535' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#282a2b'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#e2e2e2', fontFamily: 'Nunito Sans' }}>
                                                {order.first_name} {order.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{order.email}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                                {order.city}, {order.country}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full"
                                                    style={{ background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'Nunito Sans' }}>
                                                    {order.ticket_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => setSelectedOrder(order)}
                                                    className="text-xs font-bold" style={{ color: '#acc9ef', fontFamily: 'Nunito Sans' }}>View</button>
                                                <button onClick={() => handleDelete(order.id)}
                                                    className="text-xs font-bold" style={{ color: '#ffb4ab', fontFamily: 'Nunito Sans' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 flex items-center justify-between border-t"
                            style={{ borderColor: '#333535', background: '#282a2b' }}>
                            <span className="text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                {orders.length} of {pagination.count} orders
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    disabled={filters.page === 1}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-30"
                                    style={{ border: '1px solid #43474d', color: '#c3c6ce', fontFamily: 'Nunito Sans' }}>
                                    Previous
                                </button>
                                <span className="text-xs px-2" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                    {filters.page} / {pagination.totalPages}
                                </span>
                                <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    disabled={filters.page >= pagination.totalPages}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-30"
                                    style={{ border: '1px solid #43474d', color: '#c3c6ce', fontFamily: 'Nunito Sans' }}>
                                    Next
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