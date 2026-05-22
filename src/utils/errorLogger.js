import { supabase } from '../supabaseClient';

const LOG_KEY = 'tfe_error_logs';
const MAX_LOCAL_LOGS = 100;

const SUPABASE_ERRORS = {
    '23505': "Cette adresse e-mail est déjà enregistrée pour cette édition.",
    '23503': "Référence invalide. Veuillez réessayer.",
    '23514': "Cette édition n'est pas encore disponible pour les inscriptions. Veuillez contacter l'organisateur.",
    '22P02': "Cette édition n'est pas encore disponible pour les inscriptions. Veuillez contacter l'organisateur.",
    '42501': "Permission refusée. Contactez l'organisateur.",
    '57014': "Le serveur a mis trop de temps à répondre. Veuillez réessayer.",
    'PGRST116': "Ressource introuvable.",
    'PGRST301': "Session expirée. Rechargez la page.",
    'FetchError': "Impossible de contacter le serveur. Vérifiez votre connexion.",
    'AuthApiError': "Erreur d'authentification. Rechargez la page.",
};

export function friendlyError(error) {
    return (
        SUPABASE_ERRORS[error?.code] ||
        SUPABASE_ERRORS[error?.name] ||
        "Une erreur est survenue. Veuillez réessayer ou contacter l'organisateur."
    );
}

export function logError(context, error, metadata = {}) {
    const entry = {
        context,
        message: error?.message || String(error),
        code: error?.code || null,
        details: error?.details || null,
        metadata,
        timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
        console.error(`[ErrorLogger][${context}]`, entry);
    }

    // Persist in localStorage (works offline, no table needed)
    try {
        const existing = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        existing.unshift(entry);
        localStorage.setItem(LOG_KEY, JSON.stringify(existing.slice(0, MAX_LOCAL_LOGS)));
    } catch (_) {}

    // Remote log — silent if error_logs table doesn't exist yet
    supabase
        .from('error_logs')
        .insert([{
            context,
            message: entry.message,
            code: entry.code,
            metadata: JSON.stringify(metadata),
        }])
        .then(({ error: e }) => {
            if (e && import.meta.env.DEV) {
                console.warn('[ErrorLogger] Remote log failed:', e.message);
            }
        });
}

export function getLocalLogs() {
    try {
        return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch (_) {
        return [];
    }
}

export function clearLocalLogs() {
    localStorage.removeItem(LOG_KEY);
}
