import React, { useState, useEffect } from 'react';
import {
    getTicketOrders,
    deleteTicketOrder,
    updateTicketOrder,
    exportTicketOrdersToCSV
} from '../services/ticketService';

export default function TicketManager() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        count: 0,
        totalPages: 0
    });

    useEffect(() => {
        loadOrders();
    }, [filters]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const result = await getTicketOrders(filters);
            setOrders(result.data);
            setPagination({
                count: result.count,
                totalPages: result.totalPages
            });
        } catch (error) {
            console.error('Error loading ticket orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ticket order?')) return;
        
        try {
            await deleteTicketOrder(id);
            loadOrders();
        } catch (error) {
            alert('Error deleting ticket order: ' + error.message);
        }
    };

    const handleExport = () => {
        const csv = exportTicketOrdersToCSV(orders);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const ViewModal = ({ order, onClose }) => {
        if (!order) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Ticket Order Details</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Order ID</label>
                                    <p className="mt-1 text-gray-900">{order.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Ticket Count</label>
                                    <p className="mt-1 text-gray-900 font-semibold">{order.ticket_count}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                                    <p className="mt-1 text-gray-900">{order.first_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                                    <p className="mt-1 text-gray-900">{order.last_name}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <p className="mt-1 text-gray-900">{order.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <p className="mt-1 text-gray-900">{order.phone}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600">Address</label>
                                <p className="mt-1 text-gray-900">{order.address}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">City</label>
                                    <p className="mt-1 text-gray-900">{order.city}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Postal Code</label>
                                    <p className="mt-1 text-gray-900">{order.postal_code}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Country</label>
                                    <p className="mt-1 text-gray-900">{order.country}</p>
                                </div>
                            </div>

                            {order.special_requests && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Special Requests</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{order.special_requests}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Newsletter</label>
                                    <p className="mt-1 text-gray-900">{order.newsletter ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                                    <p className="mt-1 text-gray-900">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
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
                <h2 className="text-2xl font-bold text-gray-900">Ticket Order Management</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={loadOrders}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            placeholder="Name or email..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="created_at">Date</option>
                            <option value="last_name">Last Name</option>
                            <option value="ticket_count">Ticket Count</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No ticket orders found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.first_name} {order.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {order.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {order.city}, {order.country}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    {order.ticket_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
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

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-700">
                                Showing {orders.length} of {pagination.count} orders
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    disabled={filters.page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2">
                                    Page {filters.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    disabled={filters.page >= pagination.totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* View Modal */}
            {selectedOrder && (
                <ViewModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
