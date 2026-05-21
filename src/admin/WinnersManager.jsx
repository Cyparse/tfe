import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const BUCKET = 'winners';

export default function WinnersManager() {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [uploading, setUploading] = useState({});
    const [error, setError] = useState('');
    const fileRefs = useRef({});

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('winners')
            .select('*')
            .order('position', { ascending: true });
        if (!error) setWinners(data || []);
        else setError(error.message);
        setLoading(false);
    };

    const updateField = (id, field, value) => {
        setWinners(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
    };

    const saveName = async (winner) => {
        setSaving(s => ({ ...s, [winner.id]: true }));
        const { error } = await supabase
            .from('winners')
            .update({ winner_name: winner.winner_name || null })
            .eq('id', winner.id);
        if (error) setError(error.message);
        setSaving(s => ({ ...s, [winner.id]: false }));
    };

    const handlePhotoUpload = async (winner, e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(u => ({ ...u, [winner.id]: true }));
        setError('');

        const ext = file.name.split('.').pop();
        const path = `${winner.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (uploadErr) { setError(uploadErr.message); setUploading(u => ({ ...u, [winner.id]: false })); return; }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from('winners').update({ photo_url: publicUrl }).eq('id', winner.id);
        if (dbErr) { setError(dbErr.message); }
        else { updateField(winner.id, 'photo_url', publicUrl); }

        setUploading(u => ({ ...u, [winner.id]: false }));
        if (fileRefs.current[winner.id]) fileRefs.current[winner.id].value = '';
    };

    const removePhoto = async (winner) => {
        if (!winner.photo_url) return;
        const path = winner.photo_url.split(`/${BUCKET}/`)[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
        await supabase.from('winners').update({ photo_url: null }).eq('id', winner.id);
        updateField(winner.id, 'photo_url', null);
    };

    const clearWinner = async (winner) => {
        await supabase.from('winners').update({ winner_name: null, photo_url: null }).eq('id', winner.id);
        await removePhoto(winner);
        setWinners(prev => prev.map(w => w.id === winner.id ? { ...w, winner_name: null, photo_url: null } : w));
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-festival-yellow)' }}>Gagnants</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(202,233,255,0.6)' }}>
                    Renseignez le nom et la photo du gagnant pour chaque édition.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16" style={{ color: 'rgba(202,233,255,0.5)' }}>Chargement…</div>
            ) : (
                <div className="flex flex-col gap-5">
                    {winners.map(winner => (
                        <div
                            key={winner.id}
                            className="rounded-2xl p-6"
                            style={{ background: winner.edition_bg, border: `1px solid ${winner.edition_color}33` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-6">

                                {/* Edition badge */}
                                <div className="flex items-center gap-3 md:w-56 shrink-0">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: winner.edition_color }} />
                                    <span className="font-semibold text-white text-base">{winner.edition_label}</span>
                                </div>

                                {/* Photo */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                                        style={{ border: `2px solid ${winner.edition_color}66`, background: `${winner.edition_color}15` }}
                                    >
                                        {winner.photo_url ? (
                                            <img src={winner.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-2xl" style={{ color: `${winner.edition_color}80` }}>person</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
                                            style={{ background: `${winner.edition_color}22`, color: winner.edition_color, border: `1px solid ${winner.edition_color}44` }}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {uploading[winner.id] ? 'hourglass_empty' : 'upload'}
                                            </span>
                                            {uploading[winner.id] ? 'Envoi…' : 'Photo'}
                                            <input
                                                ref={el => fileRefs.current[winner.id] = el}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handlePhotoUpload(winner, e)}
                                                disabled={uploading[winner.id]}
                                            />
                                        </label>
                                        {winner.photo_url && (
                                            <button
                                                onClick={() => removePhoto(winner)}
                                                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                                            >
                                                Retirer
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Name input */}
                                <div className="flex-1 flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={winner.winner_name || ''}
                                        onChange={e => updateField(winner.id, 'winner_name', e.target.value)}
                                        onBlur={() => saveName(winner)}
                                        placeholder="À venir…"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-colors"
                                        style={{
                                            background: 'rgba(0,36,66,0.5)',
                                            border: `1px solid ${winner.edition_color}44`,
                                            color: '#ffffff',
                                        }}
                                    />
                                    <button
                                        onClick={() => saveName(winner)}
                                        disabled={saving[winner.id]}
                                        className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
                                        style={{ background: winner.edition_color, color: '#002442', opacity: saving[winner.id] ? 0.6 : 1 }}
                                    >
                                        {saving[winner.id] ? '…' : 'Sauvegarder'}
                                    </button>
                                    {(winner.winner_name || winner.photo_url) && (
                                        <button
                                            onClick={() => clearWinner(winner)}
                                            className="px-3 py-2.5 rounded-xl text-sm transition-colors shrink-0"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                                            title="Remettre à zéro"
                                        >
                                            <span className="material-symbols-outlined text-base">restart_alt</span>
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
