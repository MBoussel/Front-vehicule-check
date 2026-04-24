import { useMemo, useState } from "react";
import DamagePhotoAnnotator from "../../components/Check/DamagePhotoAnnotator";
import type { CreateDamagePayload, DamagePoint } from "../../types/checkDamage";
import "./CheckDamageStep.css";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

export default function CheckDamageStep() {
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);

  const selectedDamage = useMemo(
    () => damages.find((item) => item.id === selectedDamageId) ?? null,
    [damages, selectedDamageId],
  );

  const handleAddDamage = (payload: CreateDamagePayload) => {
    const newDamage: DamagePoint = {
      id: generateId(),
      xPercent: payload.xPercent,
      yPercent: payload.yPercent,
      label: payload.label,
      type: payload.type,
      severity: payload.severity,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };

    setDamages((current) => [...current, newDamage]);
    setSelectedDamageId(newDamage.id);
  };

  const handleDeleteDamage = (damageId: string) => {
    setDamages((current) => current.filter((item) => item.id !== damageId));
    setSelectedDamageId((current) => (current === damageId ? null : current));
  };

  return (
    <main className="check-damage-step-page">
      <header className="check-damage-step-page__header">
        <div>
          <h1>Dégâts sur photo</h1>
          <p>
            Étape de check pour annoter visuellement les dégâts du véhicule.
          </p>
        </div>

        <div className="check-damage-step-page__stats">
          <span>{damages.length} dégât(s)</span>
        </div>
      </header>

      <DamagePhotoAnnotator
        imageUrl={DEMO_IMAGE}
        imageAlt="Vue du véhicule"
        damages={damages}
        selectedDamageId={selectedDamageId}
        onSelectDamage={setSelectedDamageId}
        onAddDamage={handleAddDamage}
        onDeleteDamage={handleDeleteDamage}
      />

      {selectedDamage ? (
        <section className="check-damage-summary">
          <h2>Détail du point sélectionné</h2>

          <div className="check-damage-summary__card">
            <p>
              <strong>Libellé :</strong> {selectedDamage.label}
            </p>
            <p>
              <strong>Type :</strong> {selectedDamage.type}
            </p>
            <p>
              <strong>Gravité :</strong> {selectedDamage.severity}
            </p>
            <p>
              <strong>Commentaire :</strong>{" "}
              {selectedDamage.comment || "Aucun commentaire"}
            </p>
            <p>
              <strong>Position :</strong> X {selectedDamage.xPercent.toFixed(1)}
              % / Y {selectedDamage.yPercent.toFixed(1)}%
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}