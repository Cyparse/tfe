import React, { useState, useEffect, useCallback } from 'react';
import { fetchEditions, saveEdition, deleteEdition, toggleEditionActive } from '../services/editionsService';

const EMPTY_EDITION = {
    id: null,
    value: '',
    label: '',
    month: '',
    date_display: '',
    date_iso: '',
    theme: '',
    accent: '#4289b6',
    icon: 'ac_unit',
    description: '',
    events: [{ icon: 'emoji_events', label: '' }],
    active: true,
    sort_order: 0,
};

const s = {
    card:   { background: '#00264a', border: '1px solid rgba(58,124,165,0.35)', borderRadius: '12px', padding: '16px' },
    label:  { fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-ice-blue)', marginBottom: '4px', display: 'block' },
    input:  { width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid rgba(58,124,165,0.5)', background: 'rgba(0,36,74,0.6)', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-family-body)' },
    field:  { marginBottom: '12px' },
    btn:    (color = 'var(--color-festival-yellow)', bg = 'transparent') => ({ padding: '6px 14px', borderRadius: '7px', border: `1px solid ${color}`, background: bg, color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family-body)' }),
    danger: { padding: '6px 14px', borderRadius: '7px', border: '1px solid #ffb4ab', background: 'transparent', color: '#ffb4ab', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family-body)' },
};

export default function EditionsManager() {
    const [editions, setEditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        fetchEditions(true)
            .then(data => { setEditions(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const startEdit = (ed) => {
        setEditing({
            ...ed,
            events: Array.isArray(ed.events) ? ed.events.map(e => ({ ...e })) : [{ icon: '', label: '' }],
        });
        setError('');
    };

    const startNew = () => {
        setEditing({ ...EMPTY_EDITION, events: [{ icon: 'emoji_events', label: '' }] });
        setError('');
    };

    const cancel = () => { setEditing(null); setError(''); };

    const handleField = (key, value) => setEditing(prev => ({ ...prev, [key]: value }));

    const handleEvent = (i, key, value) => setEditing(prev => {
        const events = prev.events.map((e, idx) => idx === i ? { ...e, [key]: value } : e);
        return { ...prev, events };
    });

    const addEvent = () => setEditing(prev => ({ ...prev, events: [...prev.events, { icon: '', label: '' }] }));

    const removeEvent = (i) => setEditing(prev => ({
        ...prev,
        events: prev.events.filter((_, idx) => idx !== i),
    }));

    const handleSave = async () => {
        if (!editing.value.trim() || !editing.label.trim() || !editing.date_iso) {
            setError('Identifiant, label et date ISO sont requis.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await saveEdition({
                ...editing,
                events: editing.events.filter(e => e.label.trim()),
            });
            load();
            setEditing(null);
        } catch (e) {
            setError(e.message || 'Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (ed) => {
        try {
            await toggleEditionActive(ed.id, !ed.active);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEdition(id);
            setConfirmDelete(null);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>
                        Éditions du festival
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-festival-yellow)' }}>
                        Gérez les éditions affichées sur le site et dans les formulaires
                    </p>
                </div>
                <button style={s.btn()} onClick={startNew}>
                    <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>add</span>
                    Nouvelle édition
                </button>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(147,0,10,0.5)', color: '#ffdad6' }}>
                    {error}
                </div>
            )}

            {/* Edition list */}
            {loading ? (
                <p style={{ color: 'var(--color-festival-yellow)', opacity: 0.6 }}>Chargement…</p>
            ) : editions.length === 0 ? (
                <div className="text-center py-16 rounded-xl" style={{ border: '2px dashed rgba(58,124,165,0.3)', color: 'var(--color-ice-blue)', opacity: 0.5 }}>
                    Aucune édition. Créez-en une.
                </div>
            ) : (
                <div className="flex flex-col gap-3 mb-8">
                    {editions.map(ed => (
                        <div key={ed.id} style={{ ...s.card, opacity: ed.active ? 1 : 0.5 }}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ed.accent }} />
                                    <div>
                                        <p className="font-semibold text-sm">{ed.label}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-ice-blue)', opacity: 0.6 }}>
                                            {ed.date_display} · {ed.theme}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                        background: ed.active ? 'rgba(232,169,78,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: ed.active ? 'var(--color-festival-yellow)' : 'rgba(255,255,255,0.3)',
                                        border: `1px solid ${ed.active ? 'rgba(232,169,78,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                    }}>
                                        {ed.active ? 'Actif' : 'Inactif'}
                                    </span>
                                    <button style={s.btn()} onClick={() => handleToggle(ed)}>
                                        {ed.active ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button style={s.btn('var(--color-ice-blue)')} onClick={() => startEdit(ed)}>
                                        Modifier
                                    </button>
                                    <button style={s.danger} onClick={() => setConfirmDelete(ed)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div style={{ ...s.card, maxWidth: '400px', width: '90%' }}>
                        <p className="font-semibold mb-1">Supprimer « {confirmDelete.label} » ?</p>
                        <p className="text-xs mb-4" style={{ color: 'var(--color-ice-blue)', opacity: 0.7 }}>
                            Les inscriptions et billets existants conserveront la référence de cette édition, mais elle ne sera plus proposée dans les formulaires.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button style={s.btn()} onClick={() => setConfirmDelete(null)}>Annuler</button>
                            <button style={s.danger} onClick={() => handleDelete(confirmDelete.id)}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit / Add form */}
            {editing && (
                <div style={{ ...s.card, border: '1px solid rgba(232,169,78,0.4)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-rubik)' }}>
                        {editing.id ? 'Modifier l\'édition' : 'Nouvelle édition'}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        <div style={s.field}>
                            <label style={s.label}>Identifiant *</label>
                            <input style={s.input} placeholder="ex: december_2026" value={editing.value}
                                onChange={e => handleField('value', e.target.value)} disabled={!!editing.id} />
                            <span style={{ fontSize: '10px', color: 'rgba(202,233,255,0.5)' }}>Clé unique, non modifiable après création</span>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Label *</label>
                            <input style={s.input} placeholder="Édition Décembre" value={editing.label}
                                onChange={e => handleField('label', e.target.value)} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Mois</label>
                            <input style={s.input} placeholder="Décembre" value={editing.month}
                                onChange={e => handleField('month', e.target.value)} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Date affichée</label>
                            <input style={s.input} placeholder="6 décembre 2026" value={editing.date_display}
                                onChange={e => handleField('date_display', e.target.value)} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Date ISO *</label>
                            <input style={s.input} type="datetime-local" value={editing.date_iso ? editing.date_iso.slice(0, 16) : ''}
                                onChange={e => handleField('date_iso', e.target.value + ':00Z')} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Ordre</label>
                            <input style={s.input} type="number" min="0" value={editing.sort_order}
                                onChange={e => handleField('sort_order', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div style={s.field}>
                            <label style={s.label}>Thème / sous-titre</label>
                            <input style={s.input} placeholder="Édition Ouverture" value={editing.theme}
                                onChange={e => handleField('theme', e.target.value)} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Couleur accent</label>
                            <div className="flex gap-2 items-center">
                                <input type="color" value={editing.accent} onChange={e => handleField('accent', e.target.value)}
                                    style={{ width: '36px', height: '36px', padding: '2px', borderRadius: '6px', border: '1px solid rgba(58,124,165,0.5)', background: 'none', cursor: 'pointer' }} />
                                <input style={{ ...s.input, flex: 1 }} value={editing.accent}
                                    onChange={e => handleField('accent', e.target.value)} placeholder="#4289b6" />
                            </div>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Icône (Material Symbol)</label>
                            <input style={s.input} placeholder="ac_unit" value={editing.icon}
                                onChange={e => handleField('icon', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ ...s.field, marginBottom: '16px' }}>
                        <label style={s.label}>Description</label>
                        <textarea style={{ ...s.input, resize: 'vertical', minHeight: '64px' }} value={editing.description}
                            onChange={e => handleField('description', e.target.value)} />
                    </div>

                    {/* Events */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ ...s.label, marginBottom: '8px' }}>Événements du programme</label>
                        <div className="flex flex-col gap-2">
                            {editing.events.map((ev, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input style={{ ...s.input, width: '130px', flexShrink: 0 }} placeholder="Icône (ex: star)"
                                        value={ev.icon} onChange={e => handleEvent(i, 'icon', e.target.value)} />
                                    <input style={{ ...s.input, flex: 1 }} placeholder="Description de l'événement"
                                        value={ev.label} onChange={e => handleEvent(i, 'label', e.target.value)} />
                                    <button onClick={() => removeEvent(i)} style={{ ...s.danger, padding: '6px 10px', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px', display: 'block' }}>close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button style={{ ...s.btn('var(--color-ice-blue)'), marginTop: '8px' }} onClick={addEvent}>
                            <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '13px' }}>add</span>
                            Ajouter un événement
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" id="ed-active" checked={editing.active}
                            onChange={e => handleField('active', e.target.checked)} />
                        <label htmlFor="ed-active" style={{ fontSize: '13px', color: 'var(--color-ice-blue)', cursor: 'pointer' }}>
                            Édition active (visible sur le site et dans les formulaires)
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm mb-3" style={{ color: '#ffdad6' }}>{error}</p>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button style={s.btn('rgba(255,255,255,0.4)')} onClick={cancel}>Annuler</button>
                        <button
                            style={s.btn('var(--color-festival-yellow)', 'rgba(232,169,78,0.15)')}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
