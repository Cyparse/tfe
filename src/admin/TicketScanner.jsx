import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';

const QR_DIV_ID = 'swf-ticket-scanner';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function detectType(raw) {
  if (raw.toUpperCase().startsWith('SWF-')) return 'ticket';
  if (UUID_RE.test(raw)) return 'registration';
  return null;
}

export default function TicketScanner() {
  const [phase, setPhase] = useState('idle');
  const [scanType, setScanType] = useState(null);
  const [info, setInfo] = useState(null);
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
    setInfo(null);
    setScanType(null);
    await stopScanner();
    setPhase('scanning');
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
          await dispatch(text.trim());
        },
        undefined,
      );
    } catch (e) {
      setCamErr(typeof e === 'string' ? e : (e?.message || 'Caméra non disponible'));
      qrRef.current = null;
      setPhase('idle');
    }
  };

  const dispatch = async (raw) => {
    const type = detectType(raw);
    setScanType(type);
    if (type === 'ticket') {
      await validateTicket(raw.toUpperCase());
    } else if (type === 'registration') {
      await validateRegistration(raw.toLowerCase());
    } else {
      setInfo({ raw });
      setPhase('not_found');
    }
  };

  const validateTicket = async (num) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('ticket_number, holder_name, holder_email, edition, used, used_at')
      .eq('ticket_number', num)
      .maybeSingle();

    if (error || !data) { setInfo({ raw: num }); setPhase('not_found'); return; }
    if (data.used)      { setInfo(data); setPhase('already_used'); return; }

    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from('tickets')
      .update({ used: true, used_at: now })
      .eq('ticket_number', num);

    if (upErr) { setPhase('error'); return; }
    setInfo({ ...data, used: true, used_at: now });
    setPhase('success');
  };

  const validateRegistration = async (uuid) => {
    const { data, error } = await supabase
      .from('registrations')
      .select('id, first_name, last_name, email, type, festival_edition, checked_in, checked_in_at')
      .eq('id', uuid)
      .maybeSingle();

    if (error || !data) { setInfo({ raw: uuid }); setPhase('not_found'); return; }
    if (data.checked_in) { setInfo(data); setPhase('already_used'); return; }

    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from('registrations')
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', uuid);

    if (upErr) { setPhase('error'); return; }
    setInfo({ ...data, checked_in: true, checked_in_at: now });
    setPhase('success');
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (!manual.trim()) return;
    await stopScanner();
    setPhase('loading');
    await dispatch(manual.trim());
  };

  const reset = () => startScanner();
  const isResult = ['success', 'already_used', 'not_found', 'error'].includes(phase);

  const labels = {
    success: scanType === 'registration'
      ? { title: 'Inscription validée', sub: 'Participant enregistré' }
      : { title: 'Billet validé',       sub: 'Entrée accordée' },
    already_used: scanType === 'registration'
      ? { title: 'Déjà enregistré' }
      : { title: 'Déjà utilisé' },
    not_found: scanType === 'registration'
      ? { title: 'Inscription introuvable', sub: "Ce QR code ne correspond à aucune inscription." }
      : { title: 'Billet introuvable',      sub: "Ce QR code ne correspond à aucun billet enregistré." },
  };

  const usedAt = info?.used_at || info?.checked_in_at;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-family-rubik)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Contrôle des billets
        </h2>
        <p style={{ color: 'var(--color-ice-blue)', fontSize: 13, opacity: 0.6 }}>
          Scannez le QR code sur le billet d'entrée ou la carte d'inscription.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--color-midblue)', background: '#020f1e', minHeight: 360, position: 'relative' }}>

        <div id={QR_DIV_ID} />

        {phase !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8"
            style={{ background: '#020f1e' }}>

            {phase === 'idle' && <>
              <span className="material-symbols-outlined mb-4"
                style={{ fontSize: 60, color: 'var(--color-festival-yellow)', opacity: 0.8 }}>
                qr_code_scanner
              </span>
              {camErr && <p className="mb-3 text-center" style={{ color: '#f87171', fontSize: 12, maxWidth: 280 }}>{camErr}</p>}
              <button onClick={startScanner}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                style={{ background: 'var(--color-festival-yellow)', color: 'var(--color-deep-navy)' }}>
                <span className="material-symbols-outlined text-base">camera_alt</span>
                Activer la caméra
              </button>
            </>}

            {phase === 'loading' && <>
              <div className="w-14 h-14 rounded-full border-4 animate-spin"
                style={{ borderColor: 'var(--color-midblue)', borderTopColor: 'var(--color-festival-yellow)' }} />
              <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 16, fontSize: 13 }}>Vérification…</p>
            </>}

            {phase === 'success' && (
              <div className="w-full text-center min-h-105">
                <ResultIcon icon="check_circle" color="#22c55e" bg="rgba(34,197,94,0.12)" />
                <p style={{ color: '#22c55e', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{labels.success.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>{labels.success.sub}</p>
                {info && <InfoCard info={info} type={scanType} />}
                <NextBtn onClick={reset} />
              </div>
            )}

            {phase === 'already_used' && (
              <div className="w-full text-center min-h-105">
                <ResultIcon icon="warning" color="#fbbf24" bg="rgba(251,191,36,0.12)" border="#fbbf24" />
                <p style={{ color: '#fbbf24', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{labels.already_used.title}</p>
                {usedAt && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
                    Scanné le {new Date(usedAt).toLocaleString('fr-BE', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                {info && <InfoCard info={info} type={scanType} />}
                <NextBtn onClick={reset} muted />
              </div>
            )}

            {phase === 'not_found' && (
              <div className="w-full text-center min-h-105">
                <ResultIcon icon="cancel" color="#ef4444" bg="rgba(239,68,68,0.12)" border="#ef4444" />
                <p style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{labels.not_found.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: info?.raw ? 8 : 20 }}>
                  {labels.not_found.sub}
                </p>
                {info?.raw && (
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'monospace', marginBottom: 20, wordBreak: 'break-all' }}>
                    {info.raw}
                  </p>
                )}
                <NextBtn onClick={reset} muted label="Réessayer" />
              </div>
            )}

            {phase === 'error' && (
              <div className="w-full text-center min-h-105">
                <ResultIcon icon="error" color="#ef4444" bg="rgba(239,68,68,0.12)" border="#ef4444" />
                <p style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Erreur</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
                  Impossible de valider. Vérifiez votre connexion.
                </p>
                <NextBtn onClick={reset} muted label="Réessayer" />
              </div>
            )}
          </div>
        )}
      </div>

      {!isResult && phase !== 'loading' && (
        <div className="mt-5">
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Ou saisir le numéro manuellement
          </p>
          <form onSubmit={submitManual} className="flex gap-2">
            <input
              value={manual}
              onChange={e => setManual(e.target.value)}
              placeholder="SWF-XXX-XXXXXX ou UUID inscription"
              className="flex-1 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(0,64,117,0.5)', border: '1px solid var(--color-midblue)', color: '#fff', outline: 'none', fontFamily: 'monospace' }}
            />
            <button type="submit" className="px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: 'var(--color-midblue)', color: '#fff' }}>
              Valider
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ResultIcon({ icon, color, bg, border }) {
  return (
    <div className="mx-auto mb-5 flex items-center justify-center rounded-full"
      style={{ width: 80, height: 80, background: bg, border: `2px solid ${border || color}` }}>
      <span className="material-symbols-outlined" style={{ fontSize: 44, color }}>{icon}</span>
    </div>
  );
}

function InfoCard({ info, type }) {
  if (type === 'registration') {
    return (
      <div className="rounded-xl p-4 mb-4 text-left"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-festival-yellow)' }}>emoji_events</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-festival-yellow)' }}>
            Concours
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Participant" value={`${info.first_name} ${info.last_name}`} />
          <InfoRow label="Catégorie" value={info.type === 'pro' ? 'Professionnel' : 'Amateur'} />
          <InfoRow label="Édition" value={info.festival_edition} />
          <InfoRow label="E-mail" value={info.email} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 mb-4 text-left"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-festival-yellow)' }}>confirmation_number</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-festival-yellow)' }}>
          Billet d'entrée
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InfoRow label="N° billet" value={info.ticket_number} mono />
        <InfoRow label="Titulaire" value={info.holder_name} />
        <InfoRow label="Édition" value={info.edition} />
        <InfoRow label="E-mail" value={info.holder_email} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{label}</p>
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
