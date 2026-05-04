import { useState } from "react";

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

function CheckCreatePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [stepsData, setStepsData] = useState<Record<string, StepData>>({});

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

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>{currentStep.label}</h2>

      {/* QUESTION */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => updateStep({ hasDamage: false })}>
          ✅ Aucun dégât
        </button>

        <button onClick={() => updateStep({ hasDamage: true })}>
          ⚠️ Signaler un dégât
        </button>
      </div>

      {/* SI DEGAT */}
      {currentData.hasDamage === true && (
        <div>
          <input type="file" accept="image/*" onChange={handleFile} />

          {currentData.preview && (
            <img
              src={currentData.preview}
              alt="preview"
              style={{ width: "100%", marginTop: 10 }}
            />
          )}

          <textarea
            placeholder="Commentaire"
            value={currentData.comment || ""}
            onChange={(e) => updateStep({ comment: e.target.value })}
          />
        </div>
      )}

      {/* NAVIGATION */}
      <div style={{ marginTop: 20 }}>
        <button onClick={back} disabled={currentStepIndex === 0}>
          ⬅️ Retour
        </button>

        <button onClick={next} disabled={!isValid}>
          ➡️ Suivant
        </button>
      </div>
    </div>
  );
}

export default CheckCreatePage;