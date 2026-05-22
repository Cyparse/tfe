import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const WINNER_BUCKET   = 'winners';
const CAROUSEL_BUCKET = 'carousel-images';

export default function WinnersManager() {
    const [winners,       setWinners]       = useState([]);
    const [carouselImgs,  setCarouselImgs]  = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [saving,        setSaving]        = useState({});
    const [uploading,     setUploading]     = useState({});
    const [carUploading,  setCarUploading]  = useState(false);
    const [error,         setError]         = useState('');
    const fileRefs      = useRef({});
    const carFileRef    = useRef();

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const [wRes, cRes] = await Promise.all([
            supabase.from('winners').select('*').order('position', { ascending: true }),
            supabase.from('carousel_images').select('*').eq('section', 'winners').order('position', { ascending: true }),
        ]);
        if (!wRes.error) setWinners(wRes.data || []);
        if (!cRes.error) setCarouselImgs(cRes.data || []);
        if (wRes.error) setError(wRes.error.message);
        setLoading(false);
    };

    /* ── Winner name / photo ─────────────────────────────────────── */

    const updateField = (id, field, value) =>
        setWinners(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));

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
        const ext  = file.name.split('.').pop();
        const path = `${winner.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(WINNER_BUCKET).upload(path, file, { upsert: true });
        if (upErr) { setError(upErr.message); setUploading(u => ({ ...u, [winner.id]: false })); return; }
        const { data: { publicUrl } } = supabase.storage.from(WINNER_BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from('winners').update({ photo_url: publicUrl }).eq('id', winner.id);
        if (dbErr) setError(dbErr.message);
        else updateField(winner.id, 'photo_url', publicUrl);
        setUploading(u => ({ ...u, [winner.id]: false }));
        if (fileRefs.current[winner.id]) fileRefs.current[winner.id].value = '';
    };

    const removePhoto = async (winner) => {
        if (!winner.photo_url) return;
        const path = winner.photo_url.split(`/${WINNER_BUCKET}/`)[1];
        if (path) await supabase.storage.from(WINNER_BUCKET).remove([path]);
        await supabase.from('winners').update({ photo_url: null }).eq('id', winner.id);
        updateField(winner.id, 'photo_url', null);
    };

    const clearWinner = async (winner) => {
        await removePhoto(winner);
        await supabase.from('winners').update({ winner_name: null, photo_url: null }).eq('id', winner.id);
        setWinners(prev => prev.map(w => w.id === winner.id ? { ...w, winner_name: null, photo_url: null } : w));
    };

    /* ── Winners carousel images ─────────────────────────────────── */

    const handleCarouselUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setCarUploading(true);
        setError('');
        const maxPos = carouselImgs.length ? Math.max(...carouselImgs.map(i => i.position)) + 1 : 0;
        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const ext  = file.name.split('.').pop();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: upErr } = await supabase.storage.from(CAROUSEL_BUCKET).upload(path, file);
            if (upErr) { setError(upErr.message); setCarUploading(false); return; }
            const { data: { publicUrl } } = supabase.storage.from(CAROUSEL_BUCKET).getPublicUrl(path);
            await supabase.from('carousel_images').insert({
                url: publicUrl,
                alt: file.name.replace(/\.[^.]+$/, ''),
                position: maxPos + idx,
                active: true,
                section: 'winners',
            });
        }
        const { data } = await supabase.from('carousel_images').select('*').eq('section', 'winners').order('position', { ascending: true });
        setCarouselImgs(data || []);
        setCarUploading(false);
        if (carFileRef.current) carFileRef.current.value = '';
    };

    const deleteCarouselImg = async (img) => {
        if (!window.confirm('Supprimer cette image ?')) return;
        const path = img.url.split(`/${CAROUSEL_BUCKET}/`)[1];
        if (path) await supabase.storage.from(CAROUSEL_BUCKET).remove([path]);
        await supabase.from('carousel_images').delete().eq('id', img.id);
        setCarouselImgs(prev => prev.filter(i => i.id !== img.id));
    };

    const toggleCarouselActive = async (img) => {
        await supabase.from('carousel_images').update({ active: !img.active }).eq('id', img.id);
        setCarouselImgs(prev => prev.map(i => i.id === img.id ? { ...i, active: !i.active } : i));
    };

    /* ── Render ──────────────────────────────────────────────────── */

    return (
        <div className="flex flex-col gap-12">

            {/* ── Winner cards ── */}
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
                                            {winner.photo_url
                                                ? <img src={winner.photo_url} alt="" className="w-full h-full object-cover" />
                                                : <span className="material-symbols-outlined text-2xl" style={{ color: `${winner.edition_color}80` }}>person</span>
                                            }
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label
                                                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg"
                                                style={{ background: `${winner.edition_color}22`, color: winner.edition_color, border: `1px solid ${winner.edition_color}44` }}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {uploading[winner.id] ? 'hourglass_empty' : 'upload'}
                                                </span>
                                                {uploading[winner.id] ? 'Envoi…' : 'Photo'}
                                                <input
                                                    ref={el => fileRefs.current[winner.id] = el}
                                                    type="file" accept="image/*" className="hidden"
                                                    onChange={e => handlePhotoUpload(winner, e)}
                                                    disabled={uploading[winner.id]}
                                                />
                                            </label>
                                            {winner.photo_url && (
                                                <button
                                                    onClick={() => removePhoto(winner)}
                                                    className="text-xs px-3 py-1.5 rounded-lg"
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
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                                            style={{ background: 'rgba(0,36,66,0.5)', border: `1px solid ${winner.edition_color}44`, color: '#ffffff' }}
                                        />
                                        <button
                                            onClick={() => saveName(winner)}
                                            disabled={saving[winner.id]}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                                            style={{ background: winner.edition_color, color: '#002442', opacity: saving[winner.id] ? 0.6 : 1 }}
                                        >
                                            {saving[winner.id] ? '…' : 'Sauvegarder'}
                                        </button>
                                        {(winner.winner_name || winner.photo_url) && (
                                            <button
                                                onClick={() => clearWinner(winner)}
                                                className="px-3 py-2.5 rounded-xl text-sm shrink-0"
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

            {/* ── Carousel images ── */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--color-festival-yellow)' }}>Photos du carousel</h3>
                        <p className="text-sm mt-1" style={{ color: 'rgba(202,233,255,0.6)' }}>
                            Images affichées dans le carousel de la section Gagnants.
                        </p>
                    </div>
                    <label
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer"
                        style={{ background: 'var(--color-festival-yellow)', color: 'var(--color-dark-brown)' }}
                    >
                        <span className="material-symbols-outlined text-base">upload</span>
                        <span className="hidden sm:inline">{carUploading ? 'Envoi…' : 'Ajouter des photos'}</span>
                        <input ref={carFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCarouselUpload} disabled={carUploading} />
                    </label>
                </div>

                {carouselImgs.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl border-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(202,233,255,0.4)' }}>
                        <span className="material-symbols-outlined text-4xl mb-2 block">photo_library</span>
                        <p>Aucune photo. Ajoutez des images pour le carousel des gagnants.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {carouselImgs.map(img => (
                            <div
                                key={img.id}
                                className="rounded-xl overflow-hidden border transition-all"
                                style={{ borderColor: img.active ? 'rgba(232,169,78,0.5)' : 'rgba(255,255,255,0.1)', background: 'rgba(0,36,66,0.5)', opacity: img.active ? 1 : 0.5 }}
                            >
                                <div className="relative" style={{ aspectRatio: '1' }}>
                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                    <div
                                        className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity"
                                        style={{ background: 'rgba(0,0,0,0.5)' }}
                                    >
                                        <button
                                            onClick={() => toggleCarouselActive(img)}
                                            className="p-1.5 rounded-lg"
                                            style={{ background: 'rgba(0,36,66,0.8)', color: img.active ? '#e8a94e' : '#cae9ff' }}
                                        >
                                            <span className="material-symbols-outlined text-base">{img.active ? 'visibility' : 'visibility_off'}</span>
                                        </button>
                                        <button
                                            onClick={() => deleteCarouselImg(img)}
                                            className="p-1.5 rounded-lg"
                                            style={{ background: 'rgba(0,36,66,0.8)', color: '#f87171' }}
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="px-2 py-1.5">
                                    <p className="text-xs truncate" style={{ color: 'rgba(202,233,255,0.5)' }}>{img.alt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
