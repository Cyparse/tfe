import { supabase } from '../supabaseClient';

/**
 * Authentication Service for Admin Access
 */

// Sign in admin user
export const signInAdmin = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        if (profileError || !profile) {
            await supabase.auth.signOut();
            throw new Error('User does not have admin privileges');
        }

        return { user: data.user, profile };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

// Sign out
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Get current session
export const getCurrentSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
};

// Get current user
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

// Check if user is admin
export const isAdmin = async () => {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single();

        return !error && data;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};
