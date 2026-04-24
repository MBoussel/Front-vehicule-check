import type { ChangeEvent } from "react";

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
  return (
    <label className="contract-create-page__field">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
      />
      <small className="contract-create-page__helper">
        {isUploading ? uploadingText : uploaded ? uploadedText : emptyText}
      </small>
    </label>
  );
}

export default LicenseUploadField;