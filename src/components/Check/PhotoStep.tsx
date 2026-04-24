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
  isSubmitting,
}: PhotoStepProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [damages, setDamages] = useState<DamagePoint[]>([]);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetAll() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setDamages([]);
    setSelectedDamageId(null);

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }

  function setNewFile(file: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setDamages([]);
    setSelectedDamageId(null);
  }

  function handleCameraChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNewFile(file);
  }

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <section className="photo-step">
      <header className="photo-step__header">
        <p className="photo-step__progress">
          Étape {stepNumber} / {totalSteps}
        </p>
        <h3 className="photo-step__title">{label}</h3>
        <p className="photo-step__hint">{hint}</p>
      </header>

      {!previewUrl ? (
        <div className="photo-step__buttons">
          <button
            type="button"
            className="photo-step__primary-button"
            onClick={() => cameraInputRef.current?.click()}
          >
            Prendre une photo
          </button>

          <button
            type="button"
            className="photo-step__secondary-button"
            onClick={() => galleryInputRef.current?.click()}
          >
            Choisir depuis la galerie
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
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleCameraChange}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleGalleryChange}
      />
    </section>
  );
}

export default PhotoStep;