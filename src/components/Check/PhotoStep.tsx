import { useEffect, useRef, useState } from "react";
import type { CreateDamagePayload, DamagePoint } from "../../types/checkDamage";
import DamagePhotoAnnotator from "./DamagePhotoAnnotator";
import "./PhotoStep.css";

interface PhotoStepProps {
  label: string;
  hint: string;
  stepNumber: number;
  totalSteps: number;
  onValidate: (payload: {
    file: File;
    damages: DamagePoint[];
  }) => Promise<void>;
  onNoDamage: () => void | Promise<void>;
  onBack?: () => void;
  canGoBack?: boolean;
  isCompleted?: boolean;
  onContinue?: () => void;
  isSubmitting: boolean;
}

function generateDamageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function PhotoStep({
  label,
  hint,
  stepNumber,
  totalSteps,
  onValidate,
  onNoDamage,
  onBack,
  canGoBack = false,
  isCompleted = false,
  onContinue,
  isSubmitting,
}: PhotoStepProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [hasDamage, setHasDamage] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetAll() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setHasDamage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDamages([]);
    setSelectedDamageId(null);

    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function setNewFile(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDamages([]);
    setSelectedDamageId(null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setNewFile(file);
  }

  function handleAddDamage(payload: CreateDamagePayload) {
    const newDamage: DamagePoint = {
      id: generateDamageId(),
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
  }

  function handleDeleteDamage(damageId: string) {
    setDamages((current) => current.filter((item) => item.id !== damageId));
    setSelectedDamageId((current) => (current === damageId ? null : current));
  }

  async function handleValidate() {
    if (!selectedFile) return;

    await onValidate({
      file: selectedFile,
      damages,
    });

    resetAll();
  }

  async function handleNoDamage() {
    await onNoDamage();
    resetAll();
  }

  const cameraInputId = `camera-input-${stepNumber}`;
  const galleryInputId = `gallery-input-${stepNumber}`;

  return (
    <section className="photo-step">
      <header className="photo-step__header">
        <p className="photo-step__progress">
          Étape {stepNumber} / {totalSteps}
        </p>
        <h3 className="photo-step__title">{label}</h3>
        <p className="photo-step__hint">{hint}</p>
      </header>

      {isCompleted ? (
        <div className="photo-step__annotator-block">
          <p className="photo-step__hint">
            Cette étape est déjà validée. Tu peux revenir en arrière sans refaire la photo.
          </p>

          <div className="photo-step__buttons">
            {canGoBack && onBack ? (
              <button
                type="button"
                className="photo-step__secondary-button"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Retour
              </button>
            ) : null}

            {onContinue ? (
              <button
                type="button"
                className="photo-step__primary-button"
                onClick={onContinue}
                disabled={isSubmitting}
              >
                Continuer
              </button>
            ) : null}

            <button
              type="button"
              className="photo-step__secondary-button"
              onClick={() => setHasDamage(true)}
              disabled={isSubmitting}
            >
              Ajouter / remplacer une photo
            </button>
          </div>
        </div>
      ) : hasDamage === null ? (
        <div className="photo-step__buttons">
          <button
            type="button"
            className="photo-step__secondary-button"
            onClick={handleNoDamage}
            disabled={isSubmitting}
          >
            Aucun dégât
          </button>

          <button
            type="button"
            className="photo-step__primary-button"
            onClick={() => setHasDamage(true)}
            disabled={isSubmitting}
          >
            Signaler un dégât
          </button>

          {canGoBack && onBack ? (
            <button
              type="button"
              className="photo-step__secondary-button"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Retour
            </button>
          ) : null}
        </div>
      ) : !previewUrl ? (
        <div className="photo-step__buttons">
          <label htmlFor={cameraInputId} className="photo-step__primary-button">
            Prendre une photo
          </label>

          <label htmlFor={galleryInputId} className="photo-step__secondary-button">
            Choisir depuis la galerie
          </label>

          <button
            type="button"
            className="photo-step__secondary-button"
            onClick={() => setHasDamage(null)}
            disabled={isSubmitting}
          >
            Retour au choix
          </button>
        </div>
      ) : (
        <div className="photo-step__annotator-block">
          <DamagePhotoAnnotator
            imageUrl={previewUrl}
            imageAlt={label}
            damages={damages}
            selectedDamageId={selectedDamageId}
            onSelectDamage={setSelectedDamageId}
            onAddDamage={handleAddDamage}
            onDeleteDamage={handleDeleteDamage}
            disabled={isSubmitting}
            loading={isSubmitting}
          />

          <div className="photo-step__buttons">
            <button
              type="button"
              className="photo-step__secondary-button"
              onClick={resetAll}
              disabled={isSubmitting}
            >
              Reprendre
            </button>

            <button
              type="button"
              className="photo-step__primary-button"
              onClick={handleValidate}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Envoi..."
                : `Valider la photo (${damages.length} dégât(s))`}
            </button>
          </div>
        </div>
      )}

      <input
        id={cameraInputId}
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="photo-step__file-input"
        onChange={handleFileChange}
      />

      <input
        id={galleryInputId}
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="photo-step__file-input"
        onChange={handleFileChange}
      />
    </section>
  );
}

export default PhotoStep;