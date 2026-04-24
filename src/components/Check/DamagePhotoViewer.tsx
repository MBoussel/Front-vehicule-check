import { useMemo, useState } from "react";
import type {
  ApiDamageSeverity,
  CheckPhoto,
  CheckPhotoDamage,
  DamageType,
} from "../../types/check";
import "./DamagePhotoViewer.css";

interface DamagePhotoViewerProps {
  photo: CheckPhoto;
  title?: string;
}

function getSeverityLabel(severity: ApiDamageSeverity): string {
  switch (severity) {
    case "minor":
      return "Léger";
    case "moderate":
      return "Moyen";
    case "severe":
      return "Important";
    default:
      return "Léger";
  }
}

function getDamageTypeLabel(type: DamageType | null): string {
  switch (type) {
    case "scratch":
      return "Rayure";
    case "dent":
      return "Enfoncement";
    case "crack":
      return "Fissure";
    case "broken":
      return "Cassé";
    case "other":
      return "Autre dégât";
    default:
      return "Dégât";
  }
}

function getSeverityClassname(severity: ApiDamageSeverity): string {
  switch (severity) {
    case "minor":
      return "damage-photo-viewer__badge--minor";
    case "moderate":
      return "damage-photo-viewer__badge--moderate";
    case "severe":
      return "damage-photo-viewer__badge--severe";
    default:
      return "damage-photo-viewer__badge--minor";
  }
}

export default function DamagePhotoViewer({
  photo,
  title,
}: DamagePhotoViewerProps) {
  const [selectedDamageId, setSelectedDamageId] = useState<number | null>(null);

  const damages = useMemo(() => {
    return [...(photo.damages ?? [])].sort((a, b) => a.id - b.id);
  }, [photo.damages]);

  const selectedDamage: CheckPhotoDamage | null =
    damages.find((damage) => damage.id === selectedDamageId) ?? null;

  return (
    <section className="damage-photo-viewer">
      <header className="damage-photo-viewer__header">
        <div>
          <h3>{title ?? photo.photo_type}</h3>
          <p>
            {damages.length > 0
              ? `${damages.length} dégât(s) enregistré(s)`
              : "Aucun dégât enregistré"}
          </p>
        </div>
      </header>

      <div className="damage-photo-viewer__layout">
        <div className="damage-photo-viewer__image-panel">
          <div className="damage-photo-viewer__image-wrapper">
            <img
              src={photo.file_url}
              alt={title ?? photo.photo_type}
              className="damage-photo-viewer__image"
            />

            {damages.map((damage, index) => {
              const isSelected = damage.id === selectedDamageId;

              return (
                <button
                  key={damage.id}
                  type="button"
                  className={`damage-photo-viewer__marker ${
                    isSelected ? "damage-photo-viewer__marker--selected" : ""
                  }`}
                  style={{
                    left: `${damage.x_percent}%`,
                    top: `${damage.y_percent}%`,
                  }}
                  onClick={() => setSelectedDamageId(damage.id)}
                  aria-label={`Dégât ${index + 1}`}
                  title={`Dégât ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="damage-photo-viewer__sidebar">
          <div className="damage-photo-viewer__list-card">
            <h4>Dégâts</h4>

            {damages.length === 0 ? (
              <p className="damage-photo-viewer__empty">
                Aucun dégât détecté sur cette photo.
              </p>
            ) : (
              <ul className="damage-photo-viewer__list">
                {damages.map((damage, index) => {
                  const isSelected = damage.id === selectedDamageId;

                  return (
                    <li
                      key={damage.id}
                      className={`damage-photo-viewer__list-item ${
                        isSelected
                          ? "damage-photo-viewer__list-item--selected"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="damage-photo-viewer__list-button"
                        onClick={() => setSelectedDamageId(damage.id)}
                      >
                        <span className="damage-photo-viewer__index">
                          {index + 1}
                        </span>

                        <span className="damage-photo-viewer__content">
                          <strong>
                            {getDamageTypeLabel(damage.damage_type)}
                          </strong>

                          <span
                            className={`damage-photo-viewer__badge ${getSeverityClassname(
                              damage.severity,
                            )}`}
                          >
                            {getSeverityLabel(damage.severity)}
                          </span>

                          <small>
                            X {damage.x_percent.toFixed(1)}% • Y{" "}
                            {damage.y_percent.toFixed(1)}%
                          </small>

                          <em>{damage.comment || "Aucun commentaire"}</em>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selectedDamage ? (
            <div className="damage-photo-viewer__detail-card">
              <h4>Détail du dégât</h4>
              <p>
                <strong>Type :</strong>{" "}
                {getDamageTypeLabel(selectedDamage.damage_type)}
              </p>
              <p>
                <strong>Gravité :</strong>{" "}
                {getSeverityLabel(selectedDamage.severity)}
              </p>
              <p>
                <strong>Position :</strong> X{" "}
                {selectedDamage.x_percent.toFixed(1)}% / Y{" "}
                {selectedDamage.y_percent.toFixed(1)}%
              </p>
              <p>
                <strong>Commentaire :</strong>{" "}
                {selectedDamage.comment || "Aucun commentaire"}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}