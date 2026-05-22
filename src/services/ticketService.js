import { supabase } from '../supabaseClient';

/**
 * Ticket Service - CRUD operations for ticket orders/reservations
 */

// Get all ticket orders with pagination and filters
export const getTicketOrders = async (options = {}) => {
    const {
        page = 1,
        pageSize = 50,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options;

    try {
        let query = supabase
            .from('ticket_orders')
            .select('*', { count: 'exact' });

        // Apply filters
        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data,
            count,
            page,
            pageSize,
            totalPages: Math.ceil(count / pageSize)
        };
    } catch (error) {
        console.error('Get ticket orders error:', error);
        throw error;
    }
};

// Get single ticket order by ID
export const getTicketOrderById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('ticket_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get ticket order error:', error);
        throw error;
    }
};

// Create new ticket order
export const createTicketOrder = async (order) => {
    try {
        const { data, error } = await supabase
            .from('ticket_orders')
            .insert([order])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Create ticket order error:', error);
        throw error;
    }
};

// Update ticket order
export const updateTicketOrder = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('ticket_orders')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Update ticket order error:', error);
        throw error;
    }
};

// Delete ticket order
export const deleteTicketOrder = async (id) => {
    try {
        const { error } = await supabase
            .from('ticket_orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete ticket order error:', error);
        throw error;
    }
};

// Get ticket order statistics
export const getTicketStats = async () => {
    try {
        const { data, error } = await supabase
            .from('ticket_orders')
            .select('ticket_count, created_at');

        if (error) throw error;

        const stats = {
            totalOrders: data.length,
            totalTickets: data.reduce((sum, order) => sum + (order.ticket_count || 0), 0),
            today: data.filter(o => {
                const today = new Date().toDateString();
                return new Date(o.created_at).toDateString() === today;
            }).length,
            averageTicketsPerOrder: data.length > 0 
                ? (data.reduce((sum, o) => sum + (o.ticket_count || 0), 0) / data.length).toFixed(2)
                : 0
        };

        return stats;
    } catch (error) {
        console.error('Get ticket stats error:', error);
        throw error;
    }
};

// Export ticket orders to CSV
export const exportTicketOrdersToCSV = (orders) => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'Postal Code', 'Country', 'Ticket Count', 'Special Requests', 'Newsletter', 'Created At'];
    const rows = orders.map(o => [
        o.id,
        o.first_name,
        o.last_name,
        o.email,
        o.phone,
        o.address,
        o.city,
        o.postal_code,
        o.country,
        o.ticket_count,
        o.special_requests || '',
        o.newsletter ? 'Yes' : 'No',
        new Date(o.created_at).toLocaleString()
    ]);

    const sanitizeCell = (cell) => {
        const s = String(cell ?? '');
        const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
        return `"${safe.replace(/"/g, '""')}"`;
    };

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(sanitizeCell).join(','))
    ].join('\n');

    return csvContent;
};
