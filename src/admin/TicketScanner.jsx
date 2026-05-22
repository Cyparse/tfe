import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';

const QR_DIV_ID = 'swf-ticket-scanner';

export default function TicketScanner() {
  const [phase, setPhase] = useState('idle'); // idle | scanning | loading | success | already_used | not_found | error
  const [ticket, setTicket] = useState(null);
  const [manual, setManual] = useState('');
  const [camErr, setCamErr] = useState('');
  const qrRef = useRef(null);
  const busy = useRef(false);

  useEffect(() => () => { stopScanner(); }, []);

  const stopScanner = async () => {
    if (qrRef.current) {
      try { await qrRef.current.stop(); } catch {}
      qrRef.current = null;
    }
  };

  const startScanner = async () => {
    setCamErr('');
    busy.current = false;
    setTicket(null);
    await stopScanner();
    setPhase('scanning');

    // Let React paint the scanning phase (overlay removed) before initialising scanner
    await new Promise(r => setTimeout(r, 80));

    try {
      const qr = new Html5Qrcode(QR_DIV_ID);
      qrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        async (text) => {
          if (busy.current) return;
          busy.current = true;
          await stopScanner();
          setPhase('loading');
          await validate(text.trim().toUpperCase());
        },
        undefined,
      );
    } catch (e) {
      setCamErr(typeof e === 'string' ? e : (e?.message || 'Caméra non disponible'));
      qrRef.current = null;
      setPhase('idle');
    }
  };

  const validate = async (num) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('ticket_number, holder_name, holder_email, edition, used, used_at')
      .eq('ticket_number', num)
      .maybeSingle();

    if (error || !data) {
      setTicket({ ticket_number: num });
      setPhase('not_found');
      return;
    }

    if (data.used) {
      setTicket(data);
      setPhase('already_used');
      return;
    }

    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from('tickets')
      .update({ used: true, used_at: now })
      .eq('ticket_number', num);

    if (upErr) {
      setPhase('error');
      return;
    }

    setTicket({ ...data, used: true, used_at: now });
    setPhase('success');
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (!manual.trim()) return;
    await stopScanner();
    setPhase('loading');
    await validate(manual.trim().toUpperCase());
  };

  const reset = () => startScanner();
  const isResult = ['success', 'already_used', 'not_found', 'error'].includes(phase);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-family-rubik)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Contrôle des billets
        </h2>
        <p style={{ color: 'var(--color-ice-blue)', fontSize: 13, opacity: 0.6 }}>
          Scannez le QR code sur le billet pour valider l'entrée.
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-midblue)', background: '#020f1e', minHeight: 360, position: 'relative' }}>

        {/* Scanner div — always in DOM, html5-qrcode injects video here */}
        <div id={QR_DIV_ID} />

        {/* Overlay — covers scanner div for all non-scanning phases */}
        {phase !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8"
            style={{ background: '#020f1e' }}>

            {/* ── Idle ── */}
            {phase === 'idle' && <>
              <span className="material-symbols-outlined mb-4"
                style={{ fontSize: 60, color: 'var(--color-festival-yellow)', opacity: 0.8 }}>
                qr_code_scanner
              </span>
              {camErr && (
                <p className="mb-3 text-center" style={{ color: '#f87171', fontSize: 12, maxWidth: 280 }}>{camErr}</p>
              )}
              <button onClick={startScanner}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                style={{ background: 'var(--color-festival-yellow)', color: 'var(--color-deep-navy)' }}>
                <span className="material-symbols-outlined text-base">camera_alt</span>
                Activer la caméra
              </button>
            </>}

            {/* ── Loading ── */}
            {phase === 'loading' && <>
              <div className="w-14 h-14 rounded-full border-4 animate-spin"
                style={{ borderColor: 'var(--color-midblue)', borderTopColor: 'var(--color-festival-yellow)' }} />
              <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 16, fontSize: 13 }}>Vérification…</p>
            </>}

            {/* ── Success ── */}
            {phase === 'success' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-5 flex items-center justify-center rounded-full"
                  style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#22c55e' }}>check_circle</span>
                </div>
                <p style={{ color: '#22c55e', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Billet validé</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>Entrée accordée</p>
                {ticket && <TicketCard ticket={ticket} />}
                <NextBtn onClick={reset} />
              </div>
            )}

            {/* ── Already used ── */}
            {phase === 'already_used' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-5 flex items-center justify-center rounded-full"
                  style={{ width: 80, height: 80, background: 'rgba(251,191,36,0.12)', border: '2px solid #fbbf24' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#fbbf24' }}>warning</span>
                </div>
                <p style={{ color: '#fbbf24', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Déjà utilisé</p>
                {ticket?.used_at && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
                    Scanné le {new Date(ticket.used_at).toLocaleString('fr-BE', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                {ticket && <TicketCard ticket={ticket} />}
                <NextBtn onClick={reset} muted />
              </div>
            )}

            {/* ── Not found ── */}
            {phase === 'not_found' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-5 flex items-center justify-center rounded-full"
                  style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#ef4444' }}>cancel</span>
                </div>
                <p style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Billet introuvable</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: ticket?.ticket_number ? 8 : 20 }}>
                  Ce QR code ne correspond à aucun billet enregistré.
                </p>
                {ticket?.ticket_number && (
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace', marginBottom: 20 }}>
                    {ticket.ticket_number}
                  </p>
                )}
                <NextBtn onClick={reset} muted label="Réessayer" />
              </div>
            )}

            {/* ── Error ── */}
            {phase === 'error' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-5 flex items-center justify-center rounded-full"
                  style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#ef4444' }}>error</span>
                </div>
                <p style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Erreur</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
                  Impossible de valider ce billet. Vérifiez votre connexion.
                </p>
                <NextBtn onClick={reset} muted label="Réessayer" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual input — hidden while loading or showing a result */}
      {!isResult && phase !== 'loading' && (
        <div className="mt-5">
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Ou saisir le numéro manuellement
          </p>
          <form onSubmit={submitManual} className="flex gap-2">
            <input
              value={manual}
              onChange={e => setManual(e.target.value.toUpperCase())}
              placeholder="SWF-XXX-XXXXXX"
              className="flex-1 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(0,64,117,0.5)', border: '1px solid var(--color-midblue)', color: '#fff', outline: 'none', fontFamily: 'monospace' }}
            />
            <button type="submit"
              className="px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: 'var(--color-midblue)', color: '#fff' }}>
              Valider
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }) {
  return (
    <div className="rounded-xl p-4 mb-4 text-left"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="grid grid-cols-2 gap-3">
        <InfoRow label="N° billet" value={ticket.ticket_number} mono />
        <InfoRow label="Titulaire" value={ticket.holder_name} />
        <InfoRow label="Édition" value={ticket.edition} />
        <InfoRow label="E-mail" value={ticket.holder_email} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>
        {value || '—'}
      </p>
    </div>
  );
}

function NextBtn({ onClick, muted = false, label = 'Scanner le suivant' }) {
  return (
    <button onClick={onClick}
      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
      style={muted
        ? { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }
        : { background: 'var(--color-festival-yellow)', color: 'var(--color-deep-navy)' }}>
      <span className="material-symbols-outlined text-base">qr_code_scanner</span>
      {label}
    </button>
  );
}
