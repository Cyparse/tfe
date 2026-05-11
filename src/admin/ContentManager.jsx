import React, { useState, useEffect } from 'react';
import { getItems, createItem, updateItem, deleteItem, getTableSchema } from '../services/contentService';

const card = { background: '#002442', borderColor: '#333535' };
const inputStyle = { background: '#004075', border: '1px solid #333535', color: '#ffffff', fontFamily: 'Nunito Sans', outline: 'none' };
const labelStyle = { color: '#cae9ff', fontFamily: 'Nunito Sans', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' };

export default function ContentManager() {
    const [tableName, setTableName] = useState('');
    const [items, setItems] = useState([]);
    const [schema, setSchema] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [creatingNew, setCreatingNew] = useState(false);
    const [formData, setFormData] = useState({});

    const commonTables = ['registrations', 'ticket_orders'];

    const loadTableData = async () => {
        if (!tableName) return;
        try {
            setIsLoading(true);
            const result = await getItems(tableName, { pageSize: 100 });
            setItems(result.data);
            if (result.data.length > 0) {
                setSchema(Object.keys(result.data[0]));
            } else {
                setSchema(await getTableSchema(tableName));
            }
        } catch (e) { alert('Error loading table: ' + e.message); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (tableName) loadTableData(); }, [tableName]);

    const handleCreate = async () => {
        try { await createItem(tableName, formData); setCreatingNew(false); setFormData({}); loadTableData(); }
        catch (e) { alert('Error creating item: ' + e.message); }
    };

    const handleUpdate = async () => {
        try { await updateItem(tableName, editingItem.id, formData); setEditingItem(null); setFormData({}); loadTableData(); }
        catch (e) { alert('Error updating item: ' + e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return;
        try { await deleteItem(tableName, id); loadTableData(); }
        catch (e) { alert('Error deleting item: ' + e.message); }
    };

    const startEdit = (item) => { setEditingItem(item); setFormData({ ...item }); };
    const startCreate = () => {
        setCreatingNew(true);
        const empty = {};
        schema.forEach(f => { if (!['id', 'created_at', 'updated_at'].includes(f)) empty[f] = ''; });
        setFormData(empty);
    };

    const FormModal = ({ isEdit, onSubmit, onClose }) => (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ background: '#002442', borderColor: '#333535' }}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold" style={{ color: '#ffffff', fontFamily: 'Rubik' }}>
                            {isEdit ? 'Edit Item' : 'Create New Item'}
                        </h3>
                        <button onClick={onClose} className="material-symbols-outlined" style={{ color: '#8d9198' }}>close</button>
                    </div>
                    <div className="space-y-4">
                        {Object.keys(formData).filter(f => !['id', 'created_at', 'updated_at'].includes(f)).map(field => (
                            <div key={field}>
                                <label className="block mb-1.5" style={labelStyle}>
                                    {field.replace(/_/g, ' ')}
                                </label>
                                {['text', 'description', 'content'].some(k => field.includes(k)) ? (
                                    <textarea
                                        value={formData[field] || ''}
                                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 rounded-lg text-sm"
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                        onBlur={e => e.target.style.borderColor = '#333535'}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={formData[field] || ''}
                                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg text-sm"
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#acc9ef'}
                                        onBlur={e => e.target.style.borderColor = '#333535'}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-bold border"
                            style={{ border: '1px solid #333535', color: '#cae9ff', fontFamily: 'Nunito Sans' }}>
                            Cancel
                        </button>
                        <button onClick={onSubmit}
                            className="px-4 py-2 rounded-lg text-sm font-bold"
                            style={{ background: '#acc9ef', color: '#123250', fontFamily: 'Nunito Sans' }}>
                            {isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold" style={{ color: '#ffffff', fontFamily: 'Rubik', letterSpacing: '-0.01em' }}>
                    Content
                </h2>
                {tableName && (
                    <button onClick={startCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: '#acc9ef', color: '#123250', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                        <span className="material-symbols-outlined text-sm">add</span>
                        Create New
                    </button>
                )}
            </div>

            {/* Table Selection */}
            <div className="rounded-xl border p-4" style={card}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1.5" style={labelStyle}>Select Table</label>
                        <select value={tableName} onChange={e => setTableName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#acc9ef'}
                            onBlur={e => e.target.style.borderColor = '#333535'}>
                            <option value="">— Choose a table —</option>
                            {commonTables.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1.5" style={labelStyle}>Or enter custom table name</label>
                        <input type="text" value={tableName} onChange={e => setTableName(e.target.value)}
                            placeholder="custom_table_name"
                            className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#acc9ef'}
                            onBlur={e => e.target.style.borderColor = '#333535'} />
                    </div>
                </div>
            </div>

            {/* Data */}
            {!tableName ? (
                <div className="rounded-xl border p-12 text-center" style={card}>
                    <span className="material-symbols-outlined text-4xl mb-3 block" style={{ color: '#333535' }}>table_view</span>
                    <p style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>Select a table to manage content</p>
                </div>
            ) : isLoading ? (
                <div className="rounded-xl border p-12 text-center flex items-center justify-center gap-2" style={card}>
                    <span className="material-symbols-outlined animate-spin" style={{ color: '#8d9198' }}>progress_activity</span>
                    <span style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>Loading…</span>
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border p-12 text-center" style={card}>
                    <p style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>No items found in this table</p>
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden" style={card}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333535' }}>
                                    {schema.map(f => (
                                        <th key={f} className="px-6 py-3 text-left"
                                            style={{ ...labelStyle, background: '#004075' }}>
                                            {f.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-right"
                                        style={{ ...labelStyle, background: '#004075' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={item.id}
                                        style={{ borderBottom: i < items.length - 1 ? '1px solid #333535' : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {schema.map(f => (
                                            <td key={f} className="px-6 py-4 text-sm"
                                                style={{ color: '#cae9ff', fontFamily: 'Nunito Sans', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {String(item[f] || '').length > 50
                                                    ? String(item[f]).substring(0, 50) + '…'
                                                    : String(item[f] || '')}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => startEdit(item)}
                                                className="text-xs font-bold" style={{ color: '#acc9ef', fontFamily: 'Nunito Sans' }}>Edit</button>
                                            <button onClick={() => handleDelete(item.id)}
                                                className="text-xs font-bold" style={{ color: '#ffb4ab', fontFamily: 'Nunito Sans' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(editingItem || creatingNew) && (
                <FormModal
                    isEdit={!!editingItem}
                    onSubmit={editingItem ? handleUpdate : handleCreate}
                    onClose={() => { setEditingItem(null); setCreatingNew(false); setFormData({}); }}
                />
            )}
        </div>
    );
}