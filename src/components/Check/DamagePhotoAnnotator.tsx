import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import type {
  CreateDamagePayload,
  DamagePoint,
  DamageSeverity,
  DamageType,
} from "../../types/checkDamage";
import "./DamagePhotoAnnotator.css";

interface DamagePhotoAnnotatorProps {
  imageUrl: string;
  imageAlt?: string;
  damages: DamagePoint[];
  disabled?: boolean;
  loading?: boolean;
  onAddDamage: (payload: CreateDamagePayload) => void;
  onDeleteDamage?: (damageId: string) => void;
  selectedDamageId?: string | null;
  onSelectDamage?: (damageId: string | null) => void;
}

const DAMAGE_TYPE_OPTIONS: Array<{ value: DamageType; label: string }> = [
  { value: "scratch", label: "Rayure" },
  { value: "dent", label: "Enfoncement" },
  { value: "crack", label: "Fissure" },
  { value: "broken", label: "Cassé" },
  { value: "other", label: "Autre" },
];

const DAMAGE_SEVERITY_OPTIONS: Array<{
  value: DamageSeverity;
  label: string;
}> = [
  { value: "light", label: "Léger" },
  { value: "medium", label: "Moyen" },
  { value: "heavy", label: "Important" },
];

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function buildDefaultLabel(type: DamageType, severity: DamageSeverity): string {
  const typeMap: Record<DamageType, string> = {
    scratch: "Rayure",
    dent: "Enfoncement",
    crack: "Fissure",
    broken: "Cassé",
    other: "Dégât",
  };

  const severityMap: Record<DamageSeverity, string> = {
    light: "léger",
    medium: "moyen",
    heavy: "important",
  };

  return `${typeMap[type]} ${severityMap[severity]}`;
}

export default function DamagePhotoAnnotator({
  imageUrl,
  imageAlt = "Photo du véhicule",
  damages,
  disabled = false,
  loading = false,
  onAddDamage,
  onDeleteDamage,
  selectedDamageId = null,
  onSelectDamage,
}: DamagePhotoAnnotatorProps) {
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  const [draftPosition, setDraftPosition] = useState<{
    xPercent: number;
    yPercent: number;
  } | null>(null);

  const [damageType, setDamageType] = useState<DamageType>("scratch");
  const [damageSeverity, setDamageSeverity] =
    useState<DamageSeverity>("light");
  const [label, setLabel] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const sortedDamages = useMemo(() => {
    return [...damages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [damages]);

  const resetDraft = () => {
    setDraftPosition(null);
    setDamageType("scratch");
    setDamageSeverity("light");
    setLabel("");
    setComment("");
  };

  const handleImagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || loading) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest(".damage-marker")) {
      return;
    }

    const wrapper = imageWrapperRef.current;
    if (!wrapper) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setDraftPosition({
      xPercent: clampPercent(x),
      yPercent: clampPercent(y),
    });
  };

  const handleLabelAutoFill = (
    nextType: DamageType,
    nextSeverity: DamageSeverity,
  ) => {
    if (label.trim()) {
      return;
    }

    setLabel(buildDefaultLabel(nextType, nextSeverity));
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as DamageType;
    setDamageType(nextType);
    handleLabelAutoFill(nextType, damageSeverity);
  };

  const handleSeverityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSeverity = event.target.value as DamageSeverity;
    setDamageSeverity(nextSeverity);
    handleLabelAutoFill(damageType, nextSeverity);
  };

  const handleSaveDraft = () => {
    if (!draftPosition) {
      return;
    }

    const trimmedLabel =
      label.trim() || buildDefaultLabel(damageType, damageSeverity);

    onAddDamage({
      xPercent: draftPosition.xPercent,
      yPercent: draftPosition.yPercent,
      label: trimmedLabel,
      type: damageType,
      severity: damageSeverity,
      comment: comment.trim(),
    });

    resetDraft();
  };

  const handleDeleteClick = (damageId: string) => {
    if (!onDeleteDamage) {
      return;
    }

    onDeleteDamage(damageId);

    if (selectedDamageId === damageId && onSelectDamage) {
      onSelectDamage(null);
    }
  };

  return (
    <section className="damage-annotator">
      <div className="damage-annotator__viewer">
        <div className="damage-annotator__instructions">
          <p>
            Cliquez sur la photo pour ajouter un dégât avant validation.
          </p>
        </div>

        <div
          ref={imageWrapperRef}
          className={`damage-annotator__image-wrapper ${
            disabled ? "damage-annotator__image-wrapper--disabled" : ""
          }`}
          onPointerDown={handleImagePointerDown}
          role="button"
          tabIndex={0}
          aria-label="Zone d’annotation de la photo"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="damage-annotator__image"
            draggable={false}
          />

          {sortedDamages.map((damage, index) => {
            const isSelected = damage.id === selectedDamageId;

            return (
              <button
                key={damage.id}
                type="button"
                className={`damage-marker ${
                  isSelected ? "damage-marker--selected" : ""
                }`}
                style={{
                  left: `${damage.xPercent}%`,
                  top: `${damage.yPercent}%`,
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelectDamage?.(damage.id);
                }}
                aria-label={`Dégât ${index + 1} : ${damage.label}`}
                title={`${index + 1}. ${damage.label}`}
              >
                <span>{index + 1}</span>
              </button>
            );
          })}

          {draftPosition ? (
            <div
              className="damage-marker damage-marker--draft"
              style={{
                left: `${draftPosition.xPercent}%`,
                top: `${draftPosition.yPercent}%`,
              }}
              aria-hidden="true"
            >
              <span>+</span>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="damage-annotator__sidebar">
        {draftPosition ? (
          <div className="damage-card">
            <h3 className="damage-card__title">Nouveau dégât</h3>

            <div className="damage-card__coords">
              <span>X : {draftPosition.xPercent.toFixed(1)}%</span>
              <span>Y : {draftPosition.yPercent.toFixed(1)}%</span>
            </div>

            <div className="damage-form">
              <label className="damage-form__field">
                <span>Type</span>
                <select value={damageType} onChange={handleTypeChange}>
                  {DAMAGE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="damage-form__field">
                <span>Gravité</span>
                <select
                  value={damageSeverity}
                  onChange={handleSeverityChange}
                >
                  {DAMAGE_SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="damage-form__field">
                <span>Libellé</span>
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Ex : Rayure porte avant gauche"
                  maxLength={120}
                />
              </label>

              <label className="damage-form__field">
                <span>Commentaire</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Détail visible, longueur, profondeur..."
                  rows={4}
                  maxLength={500}
                />
              </label>

              <div className="damage-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={resetDraft}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleSaveDraft}
                >
                  Ajouter le dégât
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="damage-card damage-card--empty">
            <h3 className="damage-card__title">Ajouter un dégât</h3>
            <p>
              Cliquez sur une zone de la photo pour positionner un repère et
              ouvrir le formulaire.
            </p>
          </div>
        )}

        <div className="damage-list-card">
          <h3 className="damage-list-card__title">
            Dégâts enregistrés ({sortedDamages.length})
          </h3>

          {sortedDamages.length === 0 ? (
            <p className="damage-list-card__empty">
              Aucun dégât enregistré pour le moment.
            </p>
          ) : (
            <ul className="damage-list">
              {sortedDamages.map((damage, index) => {
                const isSelected = damage.id === selectedDamageId;

                return (
                  <li
                    key={damage.id}
                    className={`damage-list__item ${
                      isSelected ? "damage-list__item--selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="damage-list__main"
                      onClick={() => onSelectDamage?.(damage.id)}
                    >
                      <span className="damage-list__index">{index + 1}</span>

                      <span className="damage-list__content">
                        <strong>{damage.label}</strong>
                        <small>
                          {damage.type} • {damage.severity}
                        </small>
                        {damage.comment ? <em>{damage.comment}</em> : null}
                      </span>
                    </button>

                    {onDeleteDamage ? (
                      <button
                        type="button"
                        className="damage-list__delete"
                        onClick={() => handleDeleteClick(damage.id)}
                        aria-label={`Supprimer ${damage.label}`}
                      >
                        Supprimer
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </section>
  );
}