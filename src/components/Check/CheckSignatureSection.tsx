import { useMemo, useRef, useState } from "react";
import {
  uploadAgentSignature,
  uploadClientSignature,
} from "../../api/signatureApi";
import type { Check } from "../../types/check";
import type { CheckSignatureRole } from "../../types/signature";
import SignatureCanvas, {
  type SignatureCanvasRef,
} from "./SignatureCanvas";
import "./CheckSignatureSection.css";

interface CheckSignatureSectionProps {
  check: Check;
  onSigned: (updatedCheck: Check) => void;
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

  return "Une erreur est survenue pendant l'envoi de la signature.";
}

function getRoleLabel(role: CheckSignatureRole): string {
  return role === "client" ? "client" : "agent";
}

function getSignatureUrlByRole(check: Check, role: CheckSignatureRole): string | null {
  if (role === "client") {
    return check.signature_url ?? null;
  }

  return check.agent_signature_url ?? null;
}

export default function CheckSignatureSection({
  check,
  onSigned,
}: CheckSignatureSectionProps) {
  const canvasRef = useRef<SignatureCanvasRef | null>(null);

  const [selectedRole, setSelectedRole] = useState<CheckSignatureRole>("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentSignatureUrl = useMemo(() => {
    return getSignatureUrlByRole(check, selectedRole);
  }, [check, selectedRole]);

  async function handleSaveSignature() {
    const canvas = canvasRef.current;

    if (!canvas) {
      setErrorMessage("Canvas de signature indisponible.");
      return;
    }

    if (canvas.isEmpty()) {
      setErrorMessage("La signature est vide.");
      return;
    }

    const signatureBase64 = canvas.exportAsBase64();

    if (!signatureBase64) {
      setErrorMessage("Impossible d'exporter la signature.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response =
        selectedRole === "client"
          ? await uploadClientSignature(check.id, {
              signature_base64: signatureBase64,
            })
          : await uploadAgentSignature(check.id, {
              signature_base64: signatureBase64,
            });

      const updatedCheck: Check =
        selectedRole === "client"
          ? {
              ...check,
              signature_url: response.signature_url,
            }
          : {
              ...check,
              agent_signature_url: response.signature_url,
            };

      onSigned(updatedCheck);
      canvas.clear();
      setSuccessMessage(`Signature ${getRoleLabel(selectedRole)} enregistrée.`);
    } catch (error: any) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="check-signature-section">
      <div className="check-signature-section__header">
        <div>
          <h2>Signatures</h2>
          <p>
            La signature est optionnelle. Tu peux générer le PDF même sans signature
            client si le locataire n&apos;est pas sur place.
          </p>
        </div>
      </div>

      <div className="check-signature-section__role-switch">
        <button
          type="button"
          className={`check-signature-section__role-button${
            selectedRole === "client"
              ? " check-signature-section__role-button--active"
              : ""
          }`}
          onClick={() => {
            setSelectedRole("client");
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          Signature client
        </button>

        <button
          type="button"
          className={`check-signature-section__role-button${
            selectedRole === "agent"
              ? " check-signature-section__role-button--active"
              : ""
          }`}
          onClick={() => {
            setSelectedRole("agent");
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          Signature agent
        </button>
      </div>

      <div className="check-signature-section__status-grid">
        <article className="check-signature-section__status-card">
          <strong>Signature sélectionnée</strong>
          <span>
            {currentSignatureUrl
              ? "Déjà enregistrée"
              : "Aucune signature enregistrée"}
          </span>
        </article>

        <article className="check-signature-section__status-card">
          <strong>PDF</strong>
          <span>Téléchargeable avec ou sans signature</span>
        </article>
      </div>

      {currentSignatureUrl ? (
        <div className="check-signature-section__preview">
          <p className="check-signature-section__preview-label">
            Signature {getRoleLabel(selectedRole)} actuelle
          </p>
          <img
            src={currentSignatureUrl}
            alt={`Signature ${getRoleLabel(selectedRole)}`}
            className="check-signature-section__preview-image"
          />
        </div>
      ) : null}

      {errorMessage ? (
        <p className="check-signature-section__message check-signature-section__message--error">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="check-signature-section__message check-signature-section__message--success">
          {successMessage}
        </p>
      ) : null}

      <div className="check-signature-section__canvas-block">
        <p className="check-signature-section__canvas-title">
          Nouvelle signature {getRoleLabel(selectedRole)}
        </p>

        <SignatureCanvas ref={canvasRef} disabled={isSubmitting} />
      </div>

      <div className="check-signature-section__actions">
        <button
          type="button"
          className="check-signature-section__primary-button"
          onClick={handleSaveSignature}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer la signature"}
        </button>
      </div>
    </section>
  );
}