import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const BUCKET = 'carousel-images';

export default function CarouselManager() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    useEffect(() => { loadImages(); }, []);

    const loadImages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('carousel_images')
            .select('*')
            .order('position', { ascending: true });
        if (!error) setImages(data || []);
        setLoading(false);
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        setError('');
        const maxPos = images.length ? Math.max(...images.map(i => i.position)) + 1 : 0;
        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const ext = file.name.split('.').pop();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
            if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }
            const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
            const alt = file.name.replace(/\.[^.]+$/, '');
            await supabase.from('carousel_images').insert({ url: publicUrl, alt, position: maxPos + idx, active: true });
        }
        await loadImages();
        setUploading(false);
        fileInputRef.current.value = '';
    };

    const toggleActive = async (img) => {
        await supabase.from('carousel_images').update({ active: !img.active }).eq('id', img.id);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, active: !i.active } : i));
    };

    const updateAlt = async (img, alt) => {
        await supabase.from('carousel_images').update({ alt }).eq('id', img.id);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, alt } : i));
    };

    const deleteImage = async (img) => {
        if (!window.confirm('Supprimer cette image ?')) return;
        const path = img.url.split(`/${BUCKET}/`)[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
        await supabase.from('carousel_images').delete().eq('id', img.id);
        setImages(prev => prev.filter(i => i.id !== img.id));
    };

    const move = async (index, dir) => {
        const swapIndex = index + dir;
        if (swapIndex < 0 || swapIndex >= images.length) return;
        const updated = [...images];
        [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
        const newImages = updated.map((img, i) => ({ ...img, position: i }));
        setImages(newImages);
        await Promise.all([
            supabase.from('carousel_images').update({ position: newImages[index].position }).eq('id', newImages[index].id),
            supabase.from('carousel_images').update({ position: newImages[swapIndex].position }).eq('id', newImages[swapIndex].id),
        ]);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-festival-yellow)' }}>Galerie Carousel</h2>
                    <p className="text-sm mt-1" style={{ color: 'rgba(202,233,255,0.6)' }}>
                        {images.filter(i => i.active).length} image{images.filter(i => i.active).length !== 1 ? 's' : ''} visible{images.filter(i => i.active).length !== 1 ? 's' : ''}
                    </p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
                    style={{ background: 'var(--color-festival-yellow)', color: 'var(--color-dark-brown)' }}>
                    <span className="material-symbols-outlined text-base">upload</span>
                    {uploading ? 'Upload...' : 'Ajouter des images'}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16" style={{ color: 'rgba(202,233,255,0.5)' }}>Chargement...</div>
            ) : images.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(202,233,255,0.4)' }}>
                    <span className="material-symbols-outlined text-5xl mb-3 block">photo_library</span>
                    <p>Aucune image. Ajoutez des photos pour le carousel.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={img.id} className="rounded-xl overflow-hidden border transition-all"
                            style={{ borderColor: img.active ? 'rgba(232,169,78,0.5)' : 'rgba(255,255,255,0.1)', background: 'rgba(0,36,66,0.5)', opacity: img.active ? 1 : 0.5 }}>
                            <div className="relative" style={{ aspectRatio: '1' }}>
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
                                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                                    <button onClick={() => move(index, -1)} disabled={index === 0}
                                        className="p-1.5 rounded-lg disabled:opacity-30"
                                        style={{ background: 'rgba(0,36,66,0.8)', color: '#cae9ff' }}>
                                        <span className="material-symbols-outlined text-base">arrow_back</span>
                                    </button>
                                    <button onClick={() => toggleActive(img)}
                                        className="p-1.5 rounded-lg"
                                        style={{ background: 'rgba(0,36,66,0.8)', color: img.active ? '#e8a94e' : '#cae9ff' }}>
                                        <span className="material-symbols-outlined text-base">{img.active ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                    <button onClick={() => deleteImage(img)}
                                        className="p-1.5 rounded-lg"
                                        style={{ background: 'rgba(0,36,66,0.8)', color: '#f87171' }}>
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                    <button onClick={() => move(index, 1)} disabled={index === images.length - 1}
                                        className="p-1.5 rounded-lg disabled:opacity-30"
                                        style={{ background: 'rgba(0,36,66,0.8)', color: '#cae9ff' }}>
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            <div className="px-2 py-1.5">
                                <input
                                    type="text"
                                    value={img.alt}
                                    onChange={e => setImages(prev => prev.map(i => i.id === img.id ? { ...i, alt: e.target.value } : i))}
                                    onBlur={e => updateAlt(img, e.target.value)}
                                    placeholder="Légende..."
                                    className="w-full bg-transparent border-none outline-none text-xs"
                                    style={{ color: 'rgba(202,233,255,0.7)' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
