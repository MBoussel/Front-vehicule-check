import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { downloadCheckPdf, getCheckById } from "../../api/checkApi";
import CheckFinalizeSection from "../../components/Check/CheckFinalizeSection";
import CheckSignatureSection from "../../components/Check/CheckSignatureSection";
import DamagePhotoViewer from "../../components/Check/DamagePhotoViewer";
import type { Check, CheckPhoto, PhotoType } from "../../types/check";
import "./CheckDetailPage.css";

function getPhotoLabel(photoType: PhotoType): string {
  const labels: Record<PhotoType, string> = {
    front: "Photo avant",
    rear: "Photo arrière",
    front_left_angle: "Angle avant gauche",
    front_right_angle: "Angle avant droit",
    rear_left_angle: "Angle arrière gauche",
    rear_right_angle: "Angle arrière droit",
    wheel_front_left: "Jante avant gauche",
    wheel_front_right: "Jante avant droite",
    wheel_rear_left: "Jante arrière gauche",
    wheel_rear_right: "Jante arrière droite",
    windshield: "Pare-brise",
    front_seat: "Siège avant",
    rear_seat: "Siège arrière",
    trunk: "Coffre",
    dashboard: "Tableau de bord",
    other: "Photo supplémentaire",
  };

  return labels[photoType];
}

function formatCheckType(value: Check["type_check"]): string {
  return value === "departure" ? "Départ" : "Retour";
}

function formatCheckStatus(value: Check["status"]): string {
  return value === "completed" ? "Terminé" : "Brouillon";
}

function extractApiErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const location = Array.isArray(item?.loc) ? item.loc.join(" > ") : "body";
        const message = item?.msg ?? "Erreur de validation";
        return `${location}: ${message}`;
      })
      .join(" | ");
  }

  return "Impossible de télécharger le PDF.";
}

export default function CheckDetailPage() {
  const { checkId } = useParams();
  const navigate = useNavigate();

  const [check, setCheck] = useState<Check | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCheck() {
      if (!checkId) {
        setErrorMessage("Check introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getCheckById(Number(checkId));
        setCheck(data);
      } catch {
        setErrorMessage("Impossible de charger le détail du check.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCheck();
  }, [checkId]);

  const sortedPhotos = useMemo(() => {
    return [...(check?.photos ?? [])].sort((a: CheckPhoto, b: CheckPhoto) => {
      return a.display_order - b.display_order;
    });
  }, [check?.photos]);

  const totalDamages = useMemo(() => {
    return sortedPhotos.reduce((count, photo) => {
      return count + (photo.damages?.length ?? 0);
    }, 0);
  }, [sortedPhotos]);

  const isCompleted = check?.status === "completed";
  const canDownloadPdf = Boolean(check && isCompleted);

  async function handleDownloadPdf() {
    if (!check || !canDownloadPdf) return;

    try {
      setIsDownloadingPdf(true);
      setErrorMessage("");
      await downloadCheckPdf(check.id);
    } catch (error: any) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (isLoading) {
    return <p className="check-detail-page__state">Chargement du check...</p>;
  }

  if (errorMessage && !check) {
    return (
      <p className="check-detail-page__state check-detail-page__state--error">
        {errorMessage}
      </p>
    );
  }

  if (!check) {
    return (
      <p className="check-detail-page__state check-detail-page__state--error">
        Check introuvable.
      </p>
    );
  }

  return (
    <section className="check-detail-page">
      <header className="check-detail-page__header">
        <div>
          <p className="check-detail-page__eyebrow">Détail du check</p>
          <h1 className="check-detail-page__title">Check #{check.id}</h1>
          <p className="check-detail-page__description">
            Type : {formatCheckType(check.type_check)} • Statut :{" "}
            {formatCheckStatus(check.status)}
          </p>
        </div>

        <div className="check-detail-page__header-actions">
          {check.contract_id ? (
            <Link
              to={`/contracts/${check.contract_id}`}
              className="check-detail-page__secondary-button"
            >
              Retour contrat
            </Link>
          ) : null}

          {check.status === "draft" && check.contract_id ? (
            <button
              type="button"
              className="check-detail-page__primary-button"
              onClick={() =>
                navigate(`/contracts/${check.contract_id}/check?type=${check.type_check}`)
              }
            >
              Continuer le check
            </button>
          ) : (
            <button
              type="button"
              className="check-detail-page__primary-button"
              onClick={handleDownloadPdf}
              disabled={!canDownloadPdf || isDownloadingPdf}
            >
              {isDownloadingPdf
                ? "Téléchargement..."
                : canDownloadPdf
                  ? "Télécharger le PDF"
                  : "PDF disponible après finalisation"}
            </button>
          )}
        </div>
      </header>

      {!canDownloadPdf ? (
        <p className="check-detail-page__state">
          Ajoute les photos obligatoires puis finalise le check pour générer le PDF.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="check-detail-page__state check-detail-page__state--error">
          {errorMessage}
        </p>
      ) : null}

      <section className="check-detail-page__summary">
        <div className="check-detail-page__summary-card">
          <strong>Kilométrage</strong>
          <span>{check.mileage} km</span>
        </div>

        <div className="check-detail-page__summary-card">
          <strong>Carburant</strong>
          <span>{check.fuel_level}</span>
        </div>

        <div className="check-detail-page__summary-card">
          <strong>Propreté</strong>
          <span>{check.cleanliness}</span>
        </div>

        <div className="check-detail-page__summary-card">
          <strong>Photos</strong>
          <span>{sortedPhotos.length}</span>
        </div>

        <div className="check-detail-page__summary-card">
          <strong>Dégâts</strong>
          <span>{totalDamages}</span>
        </div>
      </section>

      {check.notes ? (
        <section className="check-detail-page__notes">
          <h2>Notes</h2>
          <p>{check.notes}</p>
        </section>
      ) : null}

      <CheckFinalizeSection
        check={check}
        onCompleted={(updatedCheck) => {
          setCheck(updatedCheck);
          setErrorMessage("");
        }}
      />

      <CheckSignatureSection
        check={check}
        onSigned={(updatedCheck) => setCheck(updatedCheck)}
      />

      <section className="check-detail-page__photos">
        {sortedPhotos.length === 0 ? (
          <div className="check-detail-page__empty">
            Aucune photo enregistrée pour ce check.
          </div>
        ) : (
          sortedPhotos.map((photo) => (
            <DamagePhotoViewer
              key={photo.id}
              photo={photo}
              title={getPhotoLabel(photo.photo_type)}
            />
          ))
        )}
      </section>
    </section>
  );
}