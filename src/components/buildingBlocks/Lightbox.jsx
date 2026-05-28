import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ src, alt, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                animation: 'lb-in .2s ease-out',
            }}
        >
            <style>{`@keyframes lb-in{from{opacity:0}to{opacity:1}}`}</style>
            <button
                onClick={onClose}
                aria-label="Fermer"
                style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: '50%', width: '2.5rem', height: '2.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>close</span>
            </button>
            <img
                src={src}
                alt={alt || ''}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '100%', maxHeight: '90vh',
                    objectFit: 'contain', borderRadius: '8px',
                    boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
                    animation: 'lb-img-in .25s ease-out',
                }}
            />
            <style>{`@keyframes lb-img-in{from{transform:scale(.93)}to{transform:scale(1)}}`}</style>
        </div>,
        document.body
    );
}
