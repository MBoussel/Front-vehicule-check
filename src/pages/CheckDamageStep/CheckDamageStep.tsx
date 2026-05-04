import { useState } from "react";
import type { CheckType } from "../../types/check";

interface Props {
  label: string;
  checkType: CheckType;

  defaultValue?: {
    file?: File;
    comment?: string;
    hasDamage?: boolean;
  };

  onNext: (data: {
    file?: File;
    comment?: string;
    hasDamage?: boolean;
  }) => void;

  onBack: () => void;
  canBack: boolean;
}

export default function CheckDamageStep({
  label,
  checkType,
  defaultValue,
  onNext,
  onBack,
  canBack,
}: Props) {
  const [file, setFile] = useState<File | undefined>(defaultValue?.file);
  const [comment, setComment] = useState(defaultValue?.comment ?? "");

  const [hasDamage, setHasDamage] = useState<boolean | null>(
    defaultValue?.hasDamage ?? null,
  );

  function handleNext() {
    if (checkType === "departure") {
      if (!file) {
        alert("Photo obligatoire");
        return;
      }

      onNext({ file, comment });
      return;
    }

    if (hasDamage === null) {
      alert("Choisir oui ou non");
      return;
    }

    if (hasDamage && !file) {
      alert("Photo obligatoire si dégât");
      return;
    }

    onNext({ file, comment, hasDamage });
  }

  return (
    <div>
      <h2>{label}</h2>

      {/* 🔄 RETURN UI */}
      {checkType === "return" && (
        <div>
          <p>Y a-t-il des dégâts ?</p>

          <button onClick={() => setHasDamage(true)}>Oui</button>
          <button onClick={() => setHasDamage(false)}>Non</button>
        </div>
      )}

      {/* 📸 Photo */}
      {(checkType === "departure" || hasDamage) && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      )}

      {/* 💬 Commentaire */}
      {(checkType === "departure" || hasDamage) && (
        <textarea
          placeholder="Commentaire"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      )}

      <div>
        {canBack && <button onClick={onBack}>Retour</button>}
        <button onClick={handleNext}>Suivant</button>
      </div>
    </div>
  );
}