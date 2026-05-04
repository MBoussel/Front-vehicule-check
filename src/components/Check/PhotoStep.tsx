import { useRef, useState } from "react";
import type { DamagePoint } from "../../types/checkDamage";
import type { CheckType } from "../../types/check";

import "./PhotoStep.css";

interface Props {
  label: string;
  hint?: string;
  stepNumber: number;
  totalSteps: number;

  checkType: CheckType;

  onValidate: (payload: {
    file: File;
    damages: DamagePoint[];
  }) => void;

  onNoDamage?: () => void;

  onBack: () => void;
  canGoBack: boolean;

  // 🔥 compat avec ton code actuel
  isCompleted?: boolean;
  onContinue?: () => void;

  isSubmitting?: boolean;
}

export default function PhotoStep({
  label,
  hint,
  stepNumber,
  totalSteps,
  checkType,
  onValidate,
  onNoDamage,
  onBack,
  canGoBack,
  isCompleted,
  onContinue,
  isSubmitting,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  // 🔄 uniquement pour RETURN
  const [hasDamage, setHasDamage] = useState<boolean | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleValidate() {
    if (!file) return;

    onValidate({
      file,
      damages: [], // tu gardes ton système actuel
    });
  }

  return (
    <div className="photo-step">
      <div className="photo-step__header">
        <p className="photo-step__progress">
          Étape {stepNumber} / {totalSteps}
        </p>

        <h3 className="photo-step__title">{label}</h3>

        {hint && <p className="photo-step__hint">{hint}</p>}
      </div>

      {/* 🔄 RETURN → choix dégâts */}
      {checkType === "return" && hasDamage === null && (
        <div className="photo-step__buttons">
          <button
            className="photo-step__primary-button"
            onClick={() => setHasDamage(true)}
          >
            Oui, il y a des dégâts
          </button>

          <button
            className="photo-step__secondary-button"
            onClick={() => {
              setHasDamage(false);
              onNoDamage?.();
            }}
          >
            Non, aucun dégât
          </button>
        </div>
      )}

      {/* 📸 PHOTO FLOW */}
      {(checkType === "departure" || hasDamage) && (
        <div className="photo-step__buttons">
          <button
            className="photo-step__primary-button"
            onClick={openFilePicker}
            disabled={isSubmitting}
          >
            Prendre une photo
          </button>

          <button
            className="photo-step__secondary-button"
            onClick={openFilePicker}
            disabled={isSubmitting}
          >
            Choisir depuis la galerie
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="photo-step__file-input"
            onChange={handleFileSelect}
          />

          {file && (
            <button
              className="photo-step__primary-button"
              onClick={handleValidate}
              disabled={isSubmitting}
            >
              Valider la photo
            </button>
          )}
        </div>
      )}

      {/* ✅ STEP DÉJÀ VALIDÉ */}
      {isCompleted && onContinue && (
        <div className="photo-step__buttons">
          <button
            className="photo-step__primary-button"
            onClick={onContinue}
            disabled={isSubmitting}
          >
            Continuer
          </button>
        </div>
      )}

      {/* 🔙 NAVIGATION */}
      <div className="photo-step__buttons">
        {canGoBack && (
          <button
            className="photo-step__secondary-button"
            onClick={onBack}
          >
            Retour
          </button>
        )}
      </div>
    </div>
  );
}