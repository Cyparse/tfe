import React, { useState, useEffect } from 'react';
import { getRegistrations, deleteRegistration, exportRegistrationsToCSV } from '../services/registrationService';

// Shared dark-theme primitives
const card = { background: '#002442', borderColor: '#333535' };
const input = { background: '#004075', border: '1px solid #333535', color: '#ffffff', fontFamily: 'Nunito Sans', outline: 'none' };
const labelStyle = { color: '#cae9ff', fontFamily: 'Nunito Sans', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

export default function RegistrationManager() {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
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
        if (!confirm('Delete this registration?')) return;
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
                <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'Nunito Sans' }}>{value || '—'}</p>
            </div>
        );
        return (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: '#002442', borderColor: '#333535' }}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold" style={{ color: '#ffffff', fontFamily: 'Rubik' }}>
                                Registration Details
                            </h3>
                            <button onClick={onClose} className="material-symbols-outlined transition-colors"
                                style={{ color: '#8d9198', fontSize: '1.25rem' }}>close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <Field label="Type" value={registration.type} />
                            <Field label="ID" value={registration.id} />
                            <Field label="First Name" value={registration.first_name} />
                            <Field label="Last Name" value={registration.last_name} />
                            <Field label="Email" value={registration.email} />
                            <Field label="Phone" value={registration.phone} />
                            {registration.organization && <Field label="Organization" value={registration.organization} />}
                            {registration.experience && (
                                <div className="col-span-2">
                                    <p style={labelStyle} className="mb-1">Experience</p>
                                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#ffffff', fontFamily: 'Nunito Sans' }}>{registration.experience}</p>
                                </div>
                            )}
                            <Field label="Created At" value={new Date(registration.created_at).toLocaleString()} />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-bold border transition-all"
                                style={{ border: '1px solid #333535', color: '#cae9ff', fontFamily: 'Nunito Sans' }}>
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold" style={{ color: '#ffffff', fontFamily: 'Rubik', letterSpacing: '-0.01em' }}>
                    Registrations
                </h2>
                <div className="flex gap-3">
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid #333535', color: '#ffffff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export CSV
                    </button>
                    <button onClick={loadRegistrations}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid #333535', color: '#ffffff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border p-4" style={card}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Search', element: (
                            <input type="text" value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                placeholder="Name or email…"
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}
                                onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                onBlur={e => e.target.style.borderColor = '#333535'} />
                        )},
                        { label: 'Type', element: (
                            <select value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}>
                                <option value="">All Types</option>
                                <option value="amateur">Amateur</option>
                                <option value="pro">Professional</option>
                            </select>
                        )},
                        { label: 'Sort By', element: (
                            <select value={filters.sortBy}
                                onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm"
                                style={input}>
                                <option value="created_at">Date</option>
                                <option value="last_name">Last Name</option>
                                <option value="email">Email</option>
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
                ) : registrations.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        No registrations found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333535' }}>
                                        {['Type', 'Name', 'Email', 'Phone', 'Date', ''].map(h => (
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
                                            style={{ borderBottom: i < registrations.length - 1 ? '1px solid #333535' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full"
                                                    style={reg.type === 'pro'
                                                        ? { background: 'rgba(172,201,239,0.15)', color: '#acc9ef', fontFamily: 'Nunito Sans' }
                                                        : { background: 'rgba(252,186,93,0.15)', color: '#fcba5d', fontFamily: 'Nunito Sans' }}>
                                                    {reg.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#ffffff', fontFamily: 'Nunito Sans' }}>
                                                {reg.first_name} {reg.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{reg.email}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{reg.phone}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => setSelectedReg(reg)}
                                                    className="text-xs font-bold transition-colors"
                                                    style={{ color: '#acc9ef', fontFamily: 'Nunito Sans' }}>View</button>
                                                <button onClick={() => handleDelete(reg.id)}
                                                    className="text-xs font-bold transition-colors"
                                                    style={{ color: '#ffb4ab', fontFamily: 'Nunito Sans' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 flex items-center justify-between border-t"
                            style={{ borderColor: '#333535', background: '#004075' }}>
                            <span className="text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                {registrations.length} of {pagination.count} registrations
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    disabled={filters.page === 1}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30"
                                    style={{ border: '1px solid #333535', color: '#cae9ff', fontFamily: 'Nunito Sans' }}>
                                    Previous
                                </button>
                                <span className="text-xs px-2" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                                    {filters.page} / {pagination.totalPages}
                                </span>
                                <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    disabled={filters.page >= pagination.totalPages}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30"
                                    style={{ border: '1px solid #333535', color: '#cae9ff', fontFamily: 'Nunito Sans' }}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedReg && <ViewModal registration={selectedReg} onClose={() => setSelectedReg(null)} />}
        </div>
    );
}