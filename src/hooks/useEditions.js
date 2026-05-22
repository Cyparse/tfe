import { useState, useEffect } from 'react';
import { fetchEditions } from '../services/editionsService';

export function useEditions(includeInactive = false) {
    const [editions, setEditions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchEditions(includeInactive)
            .then(data => { if (!cancelled) { setEditions(data); setLoading(false); } })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [includeInactive]);

    return { editions, loading };
}
