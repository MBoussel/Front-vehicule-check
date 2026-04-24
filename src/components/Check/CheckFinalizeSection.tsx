import { useState } from "react";
import { completeCheck } from "../../api/checkApi";
import type { Check } from "../../types/check";
import "./CheckFinalizeSection.css";

interface CheckFinalizeSectionProps {
  check: Check;
  onCompleted: (updatedCheck: Check) => void;
}

function extractApiErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const location = Array.isArray(item?.loc) ? item.loc.join(" > ") : "body";
        const message = item?.msg ?? "Erreur de validation";
        return `${location}: ${message}`;
      })
      .join(" | ");
  }

  return "Impossible de finaliser le check.";
}

export default function CheckFinalizeSection({
  check,
  onCompleted,
}: CheckFinalizeSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isCompleted = check.status === "completed";

  async function handleCompleteCheck() {
    if (isCompleted) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const updatedCheck = await completeCheck(check.id);
      onCompleted(updatedCheck);
      setSuccessMessage("Le check a bien été finalisé.");
    } catch (error: any) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="check-finalize-section">
      <div className="check-finalize-section__content">
        <div>
          <h2>Finalisation</h2>
          <p>
            Termine le check une fois les photos obligatoires ajoutées. La signature
            client reste optionnelle pour pouvoir générer le PDF même à distance.
          </p>
        </div>

        <div className="check-finalize-section__status-card">
          <strong>Statut actuel</strong>
          <span>{isCompleted ? "Terminé" : "Brouillon"}</span>
        </div>
      </div>

      {errorMessage ? (
        <p className="check-finalize-section__message check-finalize-section__message--error">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="check-finalize-section__message check-finalize-section__message--success">
          {successMessage}
        </p>
      ) : null}

      <div className="check-finalize-section__actions">
        <button
          type="button"
          className="check-finalize-section__primary-button"
          onClick={handleCompleteCheck}
          disabled={isSubmitting || isCompleted}
        >
          {isCompleted
            ? "Check déjà finalisé"
            : isSubmitting
              ? "Finalisation..."
              : "Finaliser le check"}
        </button>
      </div>
    </section>
  );
}