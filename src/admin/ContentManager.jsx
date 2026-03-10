import React, { useState, useEffect } from 'react';
import {
    getItems,
    createItem,
    updateItem,
    deleteItem,
    getTableSchema
} from '../services/contentService';

export default function ContentManager() {
    const [tableName, setTableName] = useState('');
    const [items, setItems] = useState([]);
    const [schema, setSchema] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [creatingNew, setCreatingNew] = useState(false);
    const [formData, setFormData] = useState({});

    const commonTables = [
        'registrations',
        'ticket_orders',
        // Add your custom tables here
    ];

    const loadTableData = async () => {
        if (!tableName) return;

        try {
            setIsLoading(true);
            const result = await getItems(tableName, { pageSize: 100 });
            setItems(result.data);
            
            if (result.data.length > 0) {
                const fields = Object.keys(result.data[0]);
                setSchema(fields);
            } else {
                const fields = await getTableSchema(tableName);
                setSchema(fields);
            }
        } catch (error) {
            console.error('Error loading table data:', error);
            alert('Error loading table: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tableName) {
            loadTableData();
        }
    }, [tableName]);

    const handleCreate = async () => {
        try {
            await createItem(tableName, formData);
            setCreatingNew(false);
            setFormData({});
            loadTableData();
        } catch (error) {
            alert('Error creating item: ' + error.message);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateItem(tableName, editingItem.id, formData);
            setEditingItem(null);
            setFormData({});
            loadTableData();
        } catch (error) {
            alert('Error updating item: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await deleteItem(tableName, id);
            loadTableData();
        } catch (error) {
            alert('Error deleting item: ' + error.message);
        }
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
    };

    const startCreate = () => {
        setCreatingNew(true);
        const emptyForm = {};
        schema.forEach(field => {
            if (field !== 'id' && field !== 'created_at' && field !== 'updated_at') {
                emptyForm[field] = '';
            }
        });
        setFormData(emptyForm);
    };

    const FormModal = ({ isEdit, onSubmit, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEdit ? 'Edit Item' : 'Create New Item'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {Object.keys(formData).map(field => {
                                if (field === 'id' || field === 'created_at' || field === 'updated_at') {
                                    return null;
                                }

                                return (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                            {field.replace(/_/g, ' ')}
                                        </label>
                                        {field.includes('text') || field.includes('description') || field.includes('content') ? (
                                            <textarea
                                                value={formData[field] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={4}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData[field] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {isEdit ? 'Update' : 'Create'}
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
                <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                {tableName && (
                    <button
                        onClick={startCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Create New
                    </button>
                )}
            </div>

            {/* Table Selection */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Table
                        </label>
                        <select
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Choose a table --</option>
                            {commonTables.map(table => (
                                <option key={table} value={table}>{table}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Or enter custom table name
                        </label>
                        <input
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="custom_table_name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Data Display */}
            {!tableName ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    Select a table to manage content
                </div>
            ) : isLoading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    Loading...
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No items found in this table
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {schema.map(field => (
                                        <th
                                            key={field}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                        >
                                            {field.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        {schema.map(field => (
                                            <td key={field} className="px-6 py-4 text-sm text-gray-900">
                                                {String(item[field] || '').length > 50
                                                    ? String(item[field]).substring(0, 50) + '...'
                                                    : String(item[field] || '')}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {(editingItem || creatingNew) && (
                <FormModal
                    isEdit={!!editingItem}
                    onSubmit={editingItem ? handleUpdate : handleCreate}
                    onClose={() => {
                        setEditingItem(null);
                        setCreatingNew(false);
                        setFormData({});
                    }}
                />
            )}
        </div>
    );
}
