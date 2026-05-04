import { useEffect, useRef, useState } from "react";
import type { CheckType } from "../../types/check";
import type { CreateDamagePayload, DamagePoint } from "../../types/checkDamage";
import DamagePhotoAnnotator from "./DamagePhotoAnnotator";
import "./PhotoStep.css";

interface PhotoStepProps {
  label: string;
  hint: string;
  stepNumber: number;
  totalSteps: number;
  checkType: CheckType;
  existingPhotoUrl?: string;
  existingDamages?: DamagePoint[];
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

function toDamagePoint(payload: CreateDamagePayload): DamagePoint {
  return {
    id: generateDamageId(),
    xPercent: payload.xPercent,
    yPercent: payload.yPercent,
    label: payload.label,
    type: payload.type,
    severity: payload.severity,
    comment: payload.comment,
    createdAt: new Date().toISOString(),
  };
}

function PhotoStep({
  label,
  hint,
  stepNumber,
  totalSteps,
  checkType,
  existingPhotoUrl,
  existingDamages = [],
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

  const [hasDamage, setHasDamage] = useState<boolean | null>(
    checkType === "departure" ? true : null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);
  const [forceEdit, setForceEdit] = useState(false);

  useEffect(() => {
    setHasDamage(checkType === "departure" ? true : null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setDamages([]);
    setSelectedDamageId(null);
    setForceEdit(false);
  }, [stepNumber, checkType]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetPhotoOnly() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(null);
    setPreviewUrl(null);
    setDamages([]);
    setSelectedDamageId(null);

    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function resetAll() {
    resetPhotoOnly();
    setHasDamage(checkType === "departure" ? true : null);
    setForceEdit(false);
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
    const newDamage = toDamagePoint(payload);

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
    if (checkType === "departure") return;

    await onNoDamage();
    resetAll();
  }

  function handleEditCompletedStep() {
    setForceEdit(true);
    setHasDamage(checkType === "departure" ? true : null);
    resetPhotoOnly();
  }

  const cameraInputId = `camera-input-${stepNumber}`;
  const galleryInputId = `gallery-input-${stepNumber}`;
  const shouldShowCompletedView = isCompleted && !forceEdit;

  return (
    <section className="photo-step">
      <header className="photo-step__header">
        <p className="photo-step__progress">
          Étape {stepNumber} / {totalSteps}
        </p>
        <h3 className="photo-step__title">{label}</h3>
        <p className="photo-step__hint">{hint}</p>
      </header>

      {shouldShowCompletedView ? (
        <div className="photo-step__annotator-block">
          <p className="photo-step__hint">Cette étape est déjà validée.</p>

          {existingPhotoUrl ? (
            <DamagePhotoAnnotator
              imageUrl={existingPhotoUrl}
              imageAlt={label}
              damages={existingDamages}
              selectedDamageId={selectedDamageId}
              onSelectDamage={setSelectedDamageId}
              onAddDamage={() => undefined}
              onDeleteDamage={() => undefined}
              disabled
              loading={false}
            />
          ) : (
            <p className="photo-step__hint">
              Aucun dégât signalé pour cette étape.
            </p>
          )}

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
              onClick={handleEditCompletedStep}
              disabled={isSubmitting}
            >
              {existingPhotoUrl ? "Refaire la photo" : "Modifier cette étape"}
            </button>
          </div>
        </div>
      ) : checkType === "return" && hasDamage === null ? (
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

          {checkType === "return" ? (
            <button
              type="button"
              className="photo-step__secondary-button"
              onClick={() => {
                setHasDamage(null);
                setForceEdit(false);
              }}
              disabled={isSubmitting}
            >
              Retour au choix
            </button>
          ) : null}

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
              onClick={resetPhotoOnly}
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