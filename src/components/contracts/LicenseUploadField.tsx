import type { ChangeEvent } from "react";
import "./LicenseUploadField.css";

type LicenseUploadFieldProps = {
  label: string;
  isUploading: boolean;
  uploaded: boolean;
  emptyText: string;
  uploadingText?: string;
  uploadedText?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
};

function LicenseUploadField({
  label,
  isUploading,
  uploaded,
  emptyText,
  uploadingText = "Upload en cours...",
  uploadedText = "Image enregistrée.",
  onChange,
}: LicenseUploadFieldProps) {
  const idBase = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="contract-create-page__field contract-create-page__field--full">
      <span>{label}</span>

      <div className="license-upload-field">
        {/* 📸 CAMERA */}
        <input
          id={`${idBase}-camera`}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onChange}
          hidden
        />

        <label
          htmlFor={`${idBase}-camera`}
          className="license-upload-field__button license-upload-field__button--primary"
        >
          📸 Prendre une photo
        </label>

        {/* 🖼️ GALERIE */}
        <input
          id={`${idBase}-gallery`}
          type="file"
          accept="image/*"
          onChange={onChange}
          hidden
        />

        <label
          htmlFor={`${idBase}-gallery`}
          className="license-upload-field__button license-upload-field__button--secondary"
        >
          🖼️ Choisir depuis la galerie
        </label>
      </div>

      <small className="contract-create-page__helper">
        {isUploading ? uploadingText : uploaded ? uploadedText : emptyText}
      </small>
    </div>
  );
}

export default LicenseUploadField;