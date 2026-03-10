import { supabase } from '../supabaseClient';

/**
 * Content Service - Generic CRUD operations for any content type
 */

// Get all items from a table
export const getItems = async (tableName, options = {}) => {
    const {
        page = 1,
        pageSize = 50,
        filters = {},
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options;

    try {
        let query = supabase
            .from(tableName)
            .select('*', { count: 'exact' });

        // Apply filters
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined) {
                query = query.eq(key, filters[key]);
            }
        });

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
        console.error(`Get items from ${tableName} error:`, error);
        throw error;
    }
};

// Get single item by ID
export const getItemById = async (tableName, id) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Get item from ${tableName} error:`, error);
        throw error;
    }
};

// Create new item
export const createItem = async (tableName, item) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .insert([item])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error(`Create item in ${tableName} error:`, error);
        throw error;
    }
};

// Update item
export const updateItem = async (tableName, id, updates) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error(`Update item in ${tableName} error:`, error);
        throw error;
    }
};

// Delete item
export const deleteItem = async (tableName, id) => {
    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Delete item from ${tableName} error:`, error);
        throw error;
    }
};

// Bulk operations
export const bulkCreate = async (tableName, items) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .insert(items)
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Bulk create in ${tableName} error:`, error);
        throw error;
    }
};

export const bulkUpdate = async (tableName, updates) => {
    try {
        const promises = updates.map(({ id, data }) =>
            updateItem(tableName, id, data)
        );
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error(`Bulk update in ${tableName} error:`, error);
        throw error;
    }
};

export const bulkDelete = async (tableName, ids) => {
    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .in('id', ids);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Bulk delete from ${tableName} error:`, error);
        throw error;
    }
};

// Search across columns
export const searchItems = async (tableName, searchTerm, columns = []) => {
    try {
        let query = supabase.from(tableName).select('*');

        if (columns.length > 0 && searchTerm) {
            const orConditions = columns.map(col => `${col}.ilike.%${searchTerm}%`).join(',');
            query = query.or(orConditions);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Search in ${tableName} error:`, error);
        throw error;
    }
};

// Get table schema/structure
export const getTableSchema = async (tableName) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
            return Object.keys(data[0]);
        }
        return [];
    } catch (error) {
        console.error(`Get schema for ${tableName} error:`, error);
        throw error;
    }
};
