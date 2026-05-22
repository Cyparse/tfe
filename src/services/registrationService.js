import { supabase } from '../supabaseClient';

/**
 * Registration Service - CRUD operations for event registrations
 */

// Get all registrations with pagination and filters
export const getRegistrations = async (options = {}) => {
    const {
        page = 1,
        pageSize = 50,
        type = null, // 'amateur' or 'pro'
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options;

    try {
        let query = supabase
            .from('registrations')
            .select('*', { count: 'exact' });

        // Apply filters
        if (type) {
            query = query.eq('type', type);
        }

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
        console.error('Get registrations error:', error);
        throw error;
    }
};

// Get single registration by ID
export const getRegistrationById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get registration error:', error);
        throw error;
    }
};

// Create new registration
export const createRegistration = async (registration) => {
    try {
        // Check for duplicate (email + edition) pair
        const { data: existing } = await supabase
            .from('registrations')
            .select('email')
            .ilike('email', registration.email)
            .eq('festival_edition', registration.festival_edition)
            .limit(1);

        if (existing && existing.length > 0) {
            throw new Error('Email already registered for this edition');
        }

        const { data, error } = await supabase
            .from('registrations')
            .insert([registration])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Create registration error:', error);
        throw error;
    }
};

// Update registration
export const updateRegistration = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Update registration error:', error);
        throw error;
    }
};

// Delete registration
export const deleteRegistration = async (id) => {
    try {
        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete registration error:', error);
        throw error;
    }
};

// Get registration statistics
export const getRegistrationStats = async () => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('type, created_at');

        if (error) throw error;

        const stats = {
            total: data.length,
            amateur: data.filter(r => r.type === 'amateur').length,
            pro: data.filter(r => r.type === 'pro').length,
            today: data.filter(r => {
                const today = new Date().toDateString();
                return new Date(r.created_at).toDateString() === today;
            }).length
        };

        return stats;
    } catch (error) {
        console.error('Get stats error:', error);
        throw error;
    }
};

// Export registrations to CSV
export const exportRegistrationsToCSV = (registrations) => {
    const headers = ['ID', 'Type', 'First Name', 'Last Name', 'Email', 'Phone', 'Organization', 'Experience', 'Created At'];
    const rows = registrations.map(r => [
        r.id,
        r.type,
        r.first_name,
        r.last_name,
        r.email,
        r.phone,
        r.organization || '',
        r.experience || '',
        new Date(r.created_at).toLocaleString()
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
