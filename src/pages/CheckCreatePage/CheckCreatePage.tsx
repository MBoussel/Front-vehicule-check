import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCheck } from "../../api/checkApi";
import { uploadLicensePhoto } from "../../api/uploadApi";
import type { CleanlinessLevel, FuelLevel } from "../../types/check";

type Props = {
  vehicleId: number;
  contractId?: number | null;
  typeCheck: "departure" | "return";
  mileage: number;
  fuelLevel: FuelLevel;
  cleanliness: CleanlinessLevel;
};

type Step = {
  key: string;
  label: string;
};

type StepData = {
  hasDamage: boolean | null;
  file?: File | null;
  preview?: string;
  comment?: string;
};

const STEPS: Step[] = [
  { key: "front", label: "Avant" },
  { key: "rear", label: "Arrière" },
  { key: "left", label: "Côté gauche" },
  { key: "right", label: "Côté droit" },
];

function CheckCreatePage({
  vehicleId,
  contractId,
  typeCheck,
  mileage,
  fuelLevel,
  cleanliness,
}: Props) {
  const navigate = useNavigate();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsData, setStepsData] = useState<Record<string, StepData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const currentData = stepsData[currentStep.key] || {
    hasDamage: null,
  };

  function updateStep(data: Partial<StepData>) {
    setStepsData((prev) => ({
      ...prev,
      [currentStep.key]: {
        ...prev[currentStep.key],
        ...data,
      },
    }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    updateStep({
      file,
      preview: URL.createObjectURL(file),
    });
  }

  function next() {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function back() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  const isValid =
    currentData.hasDamage === false ||
    (currentData.hasDamage === true && currentData.file);

  async function uploadAllPhotos() {
    const uploadedUrls: Record<string, string> = {};

    for (const key in stepsData) {
      const step = stepsData[key];

      if (step.hasDamage && step.file) {
        const result = await uploadLicensePhoto(step.file);
        uploadedUrls[key] = result.file_url;
      }
    }

    return uploadedUrls;
  }

  function buildPhotosPayload(uploadedUrls: Record<string, string>) {
    const photos: any[] = [];

    for (const key in stepsData) {
      const step = stepsData[key];

      if (step.hasDamage && uploadedUrls[key]) {
        photos.push({
          photo_type: key,
          file_url: uploadedUrls[key],
          has_damage: true,
          damage_comment: step.comment || null,
        });
      }
    }

    return photos;
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);

      const uploadedUrls = await uploadAllPhotos();
      const photos = buildPhotosPayload(uploadedUrls);

      const check = await createCheck({
  vehicle_id: vehicleId,
  contract_id: contractId ?? null,
  type_check: typeCheck,
  mileage: mileage,
  fuel_level: fuelLevel,
  cleanliness: cleanliness,
  photos,
});

      navigate(`/checks/${check.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur création check");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>{currentStep.label}</h2>

      <div>
        <button onClick={() => updateStep({ hasDamage: false })}>
          ✅ Aucun dégât
        </button>

        <button onClick={() => updateStep({ hasDamage: true })}>
          ⚠️ Dégât
        </button>
      </div>

      {currentData.hasDamage === true && (
        <div>
          <input type="file" onChange={handleFile} />

          {currentData.preview && (
            <img
              src={currentData.preview}
              style={{ width: "100%" }}
            />
          )}

          <textarea
            placeholder="Commentaire"
            value={currentData.comment || ""}
            onChange={(e) =>
              updateStep({ comment: e.target.value })
            }
          />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={back} disabled={currentStepIndex === 0}>
          ⬅️ Retour
        </button>

        {currentStepIndex < STEPS.length - 1 ? (
          <button onClick={next} disabled={!isValid}>
            ➡️ Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            ✅ Terminer
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckCreatePage;