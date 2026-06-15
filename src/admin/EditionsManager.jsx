import React, { useState, useEffect, useCallback } from "react";
import {
  fetchEditions,
  saveEdition,
  deleteEdition,
  toggleEditionActive,
} from "../services/editionsService";

const THEMES = [
  {
    label: "Édition Ouverture",
    accent: "#4289b6",
    icon: "ac_unit",
    description:
      "Lancement du festival, illuminations et premières sculptures de neige.",
  },
  {
    label: "Édition Mi-Hiver",
    accent: "#CAE9FF",
    icon: "ac_unit",
    description:
      "Ambiance glacée, animations nocturnes et énergie hivernale maximale.",
  },
  {
    label: "Grande Finale",
    accent: "#ffffff",
    icon: "ac_unit",
    description:
      "Dernière édition, remise des prix et final spectaculaire du festival.",
  },
  {
    label: "Édition Spéciale",
    accent: "#e8a94e",
    icon: "star",
    description: "",
  },
  {
    label: "Édition Nocturne",
    accent: "#7b5ea7",
    icon: "nightlight",
    description: "",
  },
  {
    label: "Édition Jeunesse",
    accent: "#4caf8a",
    icon: "escalator_warning",
    description: "",
  },
];

const EVENT_ICONS = [
  { value: "emoji_events", label: "Trophée amateur" },
  { value: "star", label: "Trophée pro" },
  { value: "storefront", label: "Village gastronomique" },
  { value: "celebration", label: "Cérémonie / illuminations" },
  { value: "trophy", label: "Palmarès / remise des prix" },
  { value: "music_note", label: "Musique live" },
  { value: "restaurant", label: "Restauration" },
  { value: "palette", label: "Art / exposition" },
  { value: "ice_skating", label: "Patinage" },
  { value: "ac_unit", label: "Sculpture de neige" },
  { value: "nightlife", label: "Soirée nocturne" },
  { value: "groups", label: "Animation publique" },
  { value: "camera_alt", label: "Photographie" },
  { value: "sports", label: "Sport" },
  { value: "local_activity", label: "Activité" },
  { value: "fort", label: "Bataille de boules de neige" },
];

const EMPTY_EDITION = {
  id: null,
  value: "",
  label: "",
  month: "",
  date_display: "",
  date_iso: "",
  theme: "",
  accent: "#4289b6",
  icon: "ac_unit",
  description: "",
  events: [{ icon: "emoji_events", label: "" }],
  active: true,
  sort_order: 0,
};

const s = {
  card: {
    background: "#00264a",
    border: "1px solid rgba(58,124,165,0.35)",
    borderRadius: "12px",
    padding: "16px",
  },
  label: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--color-ice-blue)",
    marginBottom: "4px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "7px",
    border: "1px solid rgba(58,124,165,0.5)",
    background: "rgba(0,36,74,0.6)",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-family-body)",
  },
  field: { marginBottom: "12px" },
  btn: (color = "var(--color-festival-yellow)", bg = "transparent") => ({
    padding: "6px 14px",
    borderRadius: "7px",
    border: `1px solid ${color}`,
    background: bg,
    color,
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-family-body)",
  }),
  danger: {
    padding: "6px 14px",
    borderRadius: "7px",
    border: "1px solid #ffb4ab",
    background: "transparent",
    color: "#ffb4ab",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-family-body)",
  },
};

export default function EditionsManager() {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchEditions(true)
      .then((data) => {
        setEditions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (ed) => {
    setEditing({
      ...ed,
      events: Array.isArray(ed.events)
        ? ed.events.map((e) => ({ ...e }))
        : [{ icon: "", label: "" }],
    });
    setError("");
  };

  const startNew = () => {
    setEditing({
      ...EMPTY_EDITION,
      events: [{ icon: "emoji_events", label: "" }],
    });
    setError("");
  };

  const cancel = () => {
    setEditing(null);
    setError("");
  };

  const handleField = (key, value) =>
    setEditing((prev) => ({ ...prev, [key]: value }));

  const handleTheme = (label) => {
    const preset = THEMES.find((t) => t.label === label);
    setEditing((prev) => ({
      ...prev,
      theme: label,
      ...(preset
        ? {
            accent: preset.accent,
            icon: preset.icon,
            description: prev.description || preset.description,
          }
        : {}),
    }));
  };

  const handleEvent = (i, key, value) =>
    setEditing((prev) => {
      const events = prev.events.map((e, idx) =>
        idx === i ? { ...e, [key]: value } : e,
      );
      return { ...prev, events };
    });

  const addEvent = () =>
    setEditing((prev) => ({
      ...prev,
      events: [...prev.events, { icon: "emoji_events", label: "" }],
    }));

  const removeEvent = (i) =>
    setEditing((prev) => ({
      ...prev,
      events: prev.events.filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    if (!editing.value.trim() || !editing.label.trim() || !editing.date_iso) {
      setError("Identifiant, label et date ISO sont requis.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveEdition({
        ...editing,
        events: editing.events.filter((e) => e.label.trim()),
      });
      load();
      setEditing(null);
    } catch (e) {
      if (e.code === '23505') {
        setError("Cet identifiant est déjà utilisé par une autre édition. Veuillez en choisir un autre.");
      } else {
        setError(e.message || "Erreur lors de la sauvegarde.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ed) => {
    setEditions(prev => prev.map(e => e.id === ed.id ? { ...e, active: !e.active } : e));
    try {
      await toggleEditionActive(ed.id, !ed.active);
    } catch (e) {
      setEditions(prev => prev.map(e => e.id === ed.id ? { ...e, active: ed.active } : e));
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    setDeleteError("");
    try {
      await deleteEdition(id);
      setConfirmDelete(null);
      load();
    } catch (e) {
      const isFk = e.code === '23503' || e.message?.includes('foreign key');
      setDeleteError(
        isFk
          ? "Impossible de supprimer : des inscriptions ou billets sont liés à cette édition. Désactivez-la plutôt."
          : (e.message || "Erreur lors de la suppression.")
      );
    }
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-family-body)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "#ffffff", fontFamily: "var(--font-family-rubik)" }}
          >
            Éditions du festival
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-festival-yellow)" }}
          >
            Gérez les éditions affichées sur le site et dans les formulaires
          </p>
        </div>
        <button style={s.btn()} onClick={startNew}>
          <span
            className="material-symbols-outlined align-middle mr-1"
            style={{ fontSize: "14px" }}
          >
            add
          </span>
          <span className="hidden sm:inline">Nouvelle édition</span>
        </button>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "rgba(147,0,10,0.2)",
            border: "1px solid rgba(147,0,10,0.5)",
            color: "#ffdad6",
          }}
        >
          {error}
        </div>
      )}

      {/* Edition list */}
      {loading ? (
        <p style={{ color: "var(--color-festival-yellow)", opacity: 0.6 }}>
          Chargement…
        </p>
      ) : editions.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{
            border: "2px dashed rgba(58,124,165,0.3)",
            color: "var(--color-ice-blue)",
            opacity: 0.5,
          }}
        >
          Aucune édition. Créez-en une.
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {editions.map((ed) => (
            <div
              key={ed.id}
              style={s.card}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3" style={{ opacity: ed.active ? 1 : 0.5 }}>
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: ed.accent }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{ed.label}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-ice-blue)", opacity: 0.6 }}
                    >
                      {ed.date_display} · {ed.theme}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      opacity: ed.active ? 1 : 0.5,
                      background: ed.active
                        ? "rgba(232,169,78,0.15)"
                        : "rgba(255,255,255,0.05)",
                      color: ed.active
                        ? "var(--color-festival-yellow)"
                        : "rgba(255,255,255,0.3)",
                      border: `1px solid ${ed.active ? "rgba(232,169,78,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {ed.active ? "Actif" : "Inactif"}
                  </span>
                  <button style={s.btn()} onClick={() => handleToggle(ed)} className="flex items-center gap-1">
                    <span className="hidden sm:inline">{ed.active ? "Désactiver" : "Activer"}</span>
                    <span className="material-symbols-outlined text-sm sm:hidden">{ed.active ? "toggle_off" : "toggle_on"}</span>
                  </button>
                  <button
                    style={{ ...s.btn("var(--color-ice-blue)"), opacity: ed.active ? 1 : 0.5 }}
                    onClick={() => startEdit(ed)}
                    className="flex items-center gap-1">
                    <span className="hidden sm:inline">Modifier</span>
                    <span className="material-symbols-outlined text-sm sm:hidden">edit</span>
                  </button>
                  <button style={{ ...s.danger, opacity: ed.active ? 1 : 0.5 }} onClick={() => setConfirmDelete(ed)} className="flex items-center gap-1">
                    <span className="hidden sm:inline">Supprimer</span>
                    <span className="material-symbols-outlined text-sm sm:hidden">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div style={{ ...s.card, maxWidth: "400px", width: "90%" }}>
            <p className="font-semibold mb-1">
              Supprimer « {confirmDelete.label} » ?
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--color-ice-blue)", opacity: 0.7 }}
            >
              Les inscriptions et billets existants conserveront la référence de
              cette édition, mais elle ne sera plus proposée dans les
              formulaires.
            </p>
            {deleteError && (
              <p className="text-xs mb-3 mt-1" style={{ color: "#ffdad6" }}>{deleteError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button style={s.btn()} onClick={() => { setConfirmDelete(null); setDeleteError(""); }}>
                Annuler
              </button>
              <button
                style={s.danger}
                onClick={() => handleDelete(confirmDelete.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add form */}
      {editing && (
        <div style={{ ...s.card, border: "1px solid rgba(232,169,78,0.4)" }}>
          <h3
            className="font-semibold mb-4"
            style={{
              color: "var(--color-festival-yellow)",
              fontFamily: "var(--font-family-rubik)",
            }}
          >
            {editing.id ? "Modifier l'édition" : "Nouvelle édition"}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div style={s.field}>
              <label style={s.label}>Identifiant *</label>
              <input
                style={s.input}
                placeholder="ex: december_2026"
                value={editing.value}
                onChange={(e) => handleField("value", e.target.value)}
                disabled={!!editing.id}
              />
              <span
                style={{ fontSize: "10px", color: "rgba(202,233,255,0.5)" }}
              >
                Clé unique, non modifiable après création
              </span>
            </div>
            <div style={s.field}>
              <label style={s.label}>Label *</label>
              <input
                style={s.input}
                placeholder="Édition Décembre"
                value={editing.label}
                onChange={(e) => handleField("label", e.target.value)}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Mois</label>
              <input
                style={s.input}
                placeholder="Décembre"
                value={editing.month}
                onChange={(e) => handleField("month", e.target.value)}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Date affichée</label>
              <input
                style={s.input}
                placeholder="6 décembre 2026"
                value={editing.date_display}
                onChange={(e) => handleField("date_display", e.target.value)}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Date ISO *</label>
              <input
                style={{ ...s.input, colorScheme: "dark" }}
                type="datetime-local"
                value={editing.date_iso ? editing.date_iso.slice(0, 16) : ""}
                onChange={(e) =>
                  handleField("date_iso", e.target.value + ":00Z")
                }
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Ordre</label>
              <input
                style={s.input}
                type="number"
                min="0"
                value={editing.sort_order}
                onChange={(e) =>
                  handleField("sort_order", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div style={s.field}>
              <label style={s.label}>Thème</label>
              <select
                style={s.input}
                value={editing.theme}
                onChange={(e) => handleTheme(e.target.value)}
              >
                <option value="">— Choisir un thème —</option>
                {THEMES.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Aperçu</label>
              <div className="flex items-center gap-3 h-9">
                <div
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{
                    background: editing.accent,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{ color: editing.accent, fontSize: "20px" }}
                >
                  {editing.icon}
                </span>
                <span
                  style={{ fontSize: "12px", color: "rgba(202,233,255,0.6)" }}
                >
                  {editing.accent} · {editing.icon}
                </span>
              </div>
            </div>
          </div>

          <div style={{ ...s.field, marginBottom: "16px" }}>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, resize: "vertical", minHeight: "64px" }}
              value={editing.description}
              onChange={(e) => handleField("description", e.target.value)}
            />
          </div>

          {/* Events */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ ...s.label, marginBottom: "8px" }}>
              Événements du programme
            </label>
            <div className="flex flex-col gap-2">
              {editing.events.map((ev, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "18px",
                        color: editing.accent,
                        width: "22px",
                        textAlign: "center",
                      }}
                    >
                      {ev.icon || "help_outline"}
                    </span>
                    <select
                      style={{ ...s.input, width: "180px" }}
                      value={ev.icon}
                      onChange={(e) => handleEvent(i, "icon", e.target.value)}
                    >
                      <option value="">— Icône —</option>
                      {EVENT_ICONS.map((ic) => (
                        <option key={ic.value} value={ic.value}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    placeholder="Description de l'événement"
                    value={ev.label}
                    onChange={(e) => handleEvent(i, "label", e.target.value)}
                  />
                  <button
                    onClick={() => removeEvent(i)}
                    style={{ ...s.danger, padding: "6px 10px", flexShrink: 0 }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px", display: "block" }}
                    >
                      close
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <button
              style={{ ...s.btn("var(--color-ice-blue)"), marginTop: "8px" }}
              onClick={addEvent}
            >
              <span
                className="material-symbols-outlined align-middle mr-1"
                style={{ fontSize: "13px" }}
              >
                add
              </span>
              Ajouter un événement
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="ed-active"
              checked={editing.active}
              onChange={(e) => handleField("active", e.target.checked)}
            />
            <label
              htmlFor="ed-active"
              style={{
                fontSize: "13px",
                color: "var(--color-ice-blue)",
                cursor: "pointer",
              }}
            >
              Édition active (visible sur le site et dans les formulaires)
            </label>
          </div>

          {error && (
            <p className="text-sm mb-3" style={{ color: "#ffdad6" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <button style={s.btn("rgba(255,255,255,0.4)")} onClick={cancel}>
              Annuler
            </button>
            <button
              style={s.btn(
                "var(--color-festival-yellow)",
                "rgba(232,169,78,0.15)",
              )}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
