import { useState } from "react";
import { Copy, Trash2, Play, Edit2, Upload, Download, Plus } from "lucide-react";
import { useStore } from "@/store";
import { Profile } from "@/types";

const card: React.CSSProperties = {
  background: "#141416",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  padding: 16,
};

export function Profiles() {
  const profiles        = useStore((s) => s.profiles);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const setActive       = useStore((s) => s.setActiveProfile);
  const createProfile   = useStore((s) => s.createProfile);
  const duplicateProfile= useStore((s) => s.duplicateProfile);
  const deleteProfile   = useStore((s) => s.deleteProfile);
  const updateName      = useStore((s) => s.updateProfileName);

  const [newName,   setNewName]   = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew,   setShowNew]   = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProfile(newName.trim());
    setNewName("");
    setShowNew(false);
  };

  const handleExport = (profile: Profile) => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${profile.name.replace(/\s+/g, "_")}_koredeck.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Profile;
          createProfile(`${data.name} (importé)`);
        } catch { alert("Fichier JSON invalide"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <main style={{ padding: "26px 22px", flex: 1, overflowY: "auto" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 22,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#ECECEF", letterSpacing: "-0.02em" }}>
            Profils
          </h1>
          <p style={{ fontSize: 12, color: "#4E4E60", marginTop: 3 }}>
            {profiles.length} profil{profiles.length > 1 ? "s" : ""} configuré{profiles.length > 1 ? "s" : ""}
          </p>
        </div>
        <ActionButton Icon={Upload} label="Importer" onClick={handleImport} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 12,
      }}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            isEditing={editingId === profile.id}
            onActivate={() => setActive(profile.id)}
            onDuplicate={() => duplicateProfile(profile.id)}
            onDelete={() => { if (profiles.length > 1) deleteProfile(profile.id); }}
            onExport={() => handleExport(profile)}
            onStartEdit={() => setEditingId(profile.id)}
            onSaveName={(name) => { updateName(profile.id, name); setEditingId(null); }}
            canDelete={profiles.length > 1}
          />
        ))}

        {showNew ? (
          <div style={{ ...card, border: "1px solid rgba(99,102,241,0.30)" }}>
            <div style={{
              fontSize: 10, color: "#4E4E60", fontWeight: 600,
              marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.09em",
            }}>
              Nouveau profil
            </div>
            <input
              type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Ex: Gaming, Travail..."
              autoFocus style={{ marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowNew(false)} style={{
                flex: 1, background: "none",
                border: "1px solid rgba(255,255,255,0.09)",
                padding: 6, color: "#8E8EA0", borderRadius: 6, fontSize: 12,
              }}>
                Annuler
              </button>
              <button onClick={handleCreate} disabled={!newName.trim()} style={{
                flex: 1,
                background: newName.trim() ? "#6366F1" : "rgba(99,102,241,0.12)",
                border: "none",
                padding: 6, color: newName.trim() ? "#fff" : "#4E4E60",
                borderRadius: 6, fontSize: 12, fontWeight: 500,
                transition: "all 0.12s",
              }}>
                Créer
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNew(true)} style={{
            border: "1px dashed rgba(255,255,255,0.10)", borderRadius: 10,
            background: "transparent", padding: 16,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 8, cursor: "pointer", minHeight: 140,
            transition: "all 0.12s",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.40)";
              e.currentTarget.style.background  = "rgba(99,102,241,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              e.currentTarget.style.background  = "transparent";
            }}
          >
            <Plus size={20} color="#4E4E60" />
            <span style={{ fontSize: 12, color: "#4E4E60" }}>Nouveau profil</span>
          </button>
        )}
      </div>
    </main>
  );
}

function ProfileCard({
  profile, isActive, isEditing, canDelete,
  onActivate, onDuplicate, onDelete, onExport, onStartEdit, onSaveName,
}: {
  profile: Profile; isActive: boolean; isEditing: boolean; canDelete: boolean;
  onActivate: () => void; onDuplicate: () => void; onDelete: () => void;
  onExport: () => void; onStartEdit: () => void; onSaveName: (name: string) => void;
}) {
  const [nameInput, setNameInput] = useState(profile.name);
  const updatedAt = new Date(profile.updatedAt);
  const diffH = Math.floor((Date.now() - updatedAt.getTime()) / 3_600_000);
  const timeLabel = diffH < 1 ? "À l'instant"
                  : diffH < 24 ? `Il y a ${diffH}h`
                  : `Le ${updatedAt.toLocaleDateString()}`;

  return (
    <div style={{
      ...card,
      border: `1px solid ${isActive ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
      boxShadow: isActive
        ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(99,102,241,0.10)"
        : card.boxShadow,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        {isEditing ? (
          <input type="text" value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => onSaveName(nameInput)}
            onKeyDown={(e) => e.key === "Enter" && onSaveName(nameInput)}
            autoFocus
            style={{ fontSize: 13, fontWeight: 500, padding: "2px 6px", flex: 1, marginRight: 8 }}
          />
        ) : (
          <div
            style={{ fontSize: 13, fontWeight: 500, color: "#ECECEF", flex: 1, cursor: "text" }}
            onDoubleClick={onStartEdit}
          >
            {profile.name}
          </div>
        )}
        {isActive && (
          <span style={{
            fontSize: 9, background: "rgba(99,102,241,0.12)", color: "#818CF8",
            border: "1px solid rgba(99,102,241,0.25)",
            padding: "2px 7px", borderRadius: 4, flexShrink: 0, letterSpacing: "0.04em",
          }}>
            Actif
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, color: "#4E4E60", marginBottom: 12 }}>{timeLabel}</div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {["🏠", "📦", "🎯", "🎮"].map((emoji, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 5,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
          }}>
            {emoji}
          </div>
        ))}
        <div style={{ fontSize: 10, color: "#4E4E60", marginLeft: 4, alignSelf: "center" }}>
          {profile.categories[0]?.buttons.length ?? 0} boutons / cat.
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {!isActive && <ActionButton Icon={Play}     label="Activer"    onClick={onActivate}  primary />}
        <ActionButton Icon={Edit2}    label="Renommer"  onClick={onStartEdit}  />
        <ActionButton Icon={Copy}     label="Dupliquer" onClick={onDuplicate}  />
        <ActionButton Icon={Download} label="Exporter"  onClick={onExport}     />
        {!isActive && canDelete && <ActionButton Icon={Trash2} label="Supprimer" onClick={onDelete} danger />}
      </div>
    </div>
  );
}

function ActionButton({ Icon, label, onClick, primary, danger }: {
  Icon: React.ElementType; label: string; onClick: () => void;
  primary?: boolean; danger?: boolean;
}) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "4px 9px",
      background: primary ? "#6366F1" : "none",
      border: `1px solid ${primary ? "transparent" : danger ? "rgba(239,68,68,0.30)" : "rgba(255,255,255,0.09)"}`,
      borderRadius: 5,
      color: primary ? "#fff" : danger ? "#EF4444" : "#8E8EA0",
      fontSize: 11, fontWeight: primary ? 500 : 400,
      transition: "all 0.12s",
    }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.background = "#4F46E5";
        } else if (danger) {
          e.currentTarget.style.background   = "rgba(239,68,68,0.08)";
          e.currentTarget.style.borderColor  = "rgba(239,68,68,0.50)";
        } else {
          e.currentTarget.style.borderColor  = "rgba(255,255,255,0.18)";
          e.currentTarget.style.color        = "#ECECEF";
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          e.currentTarget.style.background = "#6366F1";
        } else if (danger) {
          e.currentTarget.style.background  = "none";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.30)";
        } else {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          e.currentTarget.style.color       = "#8E8EA0";
        }
      }}
    >
      <Icon size={11}/> {label}
    </button>
  );
}
