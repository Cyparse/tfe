import { supabase } from '../supabaseClient';

let _cache = null;
let _promise = null;

export function invalidateEditionsCache() {
    _cache = null;
    _promise = null;
}

export async function fetchEditions(includeInactive = false) {
    if (!includeInactive && _cache) return _cache;

    if (!includeInactive && _promise) return _promise;

    const query = supabase
        .from('festival_editions')
        .select('*')
        .order('sort_order', { ascending: true });

    if (!includeInactive) {
        query.eq('active', true);
        _promise = query.then(({ data, error }) => {
            if (error) throw error;
            _cache = data ?? [];
            return _cache;
        });
        return _promise;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function saveEdition(edition) {
    const payload = {
        value: edition.value,
        label: edition.label,
        month: edition.month,
        date_display: edition.date_display,
        date_iso: edition.date_iso,
        theme: edition.theme,
        accent: edition.accent,
        icon: edition.icon,
        description: edition.description,
        events: edition.events,
        active: edition.active,
        sort_order: edition.sort_order,
    };

    if (edition.id) {
        const { data, error } = await supabase
            .from('festival_editions')
            .update(payload)
            .eq('id', edition.id)
            .select()
            .single();
        if (error) throw error;
        invalidateEditionsCache();
        return data;
    } else {
        const { data, error } = await supabase
            .from('festival_editions')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        invalidateEditionsCache();
        return data;
    }
}

export async function deleteEdition(id) {
    const { error } = await supabase
        .from('festival_editions')
        .delete()
        .eq('id', id);
    if (error) throw error;
    invalidateEditionsCache();
}

export async function toggleEditionActive(id, active) {
    const { error } = await supabase
        .from('festival_editions')
        .update({ active })
        .eq('id', id);
    if (error) throw error;
    invalidateEditionsCache();
}
