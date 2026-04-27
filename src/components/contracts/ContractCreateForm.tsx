import type { ChangeEvent, FormEvent } from "react";

import type { SignatureMode } from "../../types/contract";
import type { Vehicle } from "../../types/vehicle";
import LicenseUploadField from "./LicenseUploadField";

type ContractCreateFormProps = {
  contractNumber: string;
  setContractNumber: (value: string) => void;

  vehicleId: string;
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  selectedVehicle: Vehicle | null;

  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;

  licenseNumber: string;
  licenseIssueDate: string;
  licenseCountry: string;
  licenseFrontPhotoUrl: string;
  licenseBackPhotoUrl: string;
  isUploadingPrimaryLicense: boolean;

  secondaryDriverFirstName: string;
  secondaryDriverLastName: string;
  secondaryDriverEmail: string;
  secondaryDriverPhone: string;
  secondaryLicenseNumber: string;
  secondaryLicenseIssueDate: string;
  secondaryLicenseCountry: string;
  secondaryLicenseFrontPhotoUrl: string;
  secondaryLicenseBackPhotoUrl: string;
  isUploadingSecondaryLicense: boolean;

  startDate: string;
  endDate: string;
  rentalPrice: string;
  pickupLocation: string;
  returnLocation: string;
  deliveryFee: string;

  signatureMode: SignatureMode;
  termsAndConditions: string;

  errorMessage: string;
  isSubmitting: boolean;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel: () => void;

  setVehicleId: (value: string) => void;

  setCustomerFirstName: (value: string) => void;
  setCustomerLastName: (value: string) => void;
  setCustomerEmail: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerAddress: (value: string) => void;

  setLicenseNumber: (value: string) => void;
  setLicenseIssueDate: (value: string) => void;
  setLicenseCountry: (value: string) => void;

  setSecondaryDriverFirstName: (value: string) => void;
  setSecondaryDriverLastName: (value: string) => void;
  setSecondaryDriverEmail: (value: string) => void;
  setSecondaryDriverPhone: (value: string) => void;
  setSecondaryLicenseNumber: (value: string) => void;
  setSecondaryLicenseIssueDate: (value: string) => void;
  setSecondaryLicenseCountry: (value: string) => void;

  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setRentalPrice: (value: string) => void;
  setPickupLocation: (value: string) => void;
  setReturnLocation: (value: string) => void;
  setDeliveryFee: (value: string) => void;

  setSignatureMode: (value: SignatureMode) => void;
  setTermsAndConditions: (value: string) => void;

  onPrimaryFrontUpload: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onPrimaryBackUpload: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onSecondaryFrontUpload: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onSecondaryBackUpload: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
};

function readVehicleMoney(
  vehicle: Vehicle | null,
  fieldName: "deposit_amount" | "franchise_amount",
): string {
  if (!vehicle) return "Auto";

  const rawValue = vehicle[fieldName];

  if (typeof rawValue === "number") {
    return `${rawValue} €`;
  }

  return "Auto";
}

function ContractCreateForm(props: ContractCreateFormProps) {
  const {
  

    vehicleId,
    vehicles,
    isLoadingVehicles,
    selectedVehicle,

    customerFirstName,
    customerLastName,
    customerEmail,
    customerPhone,
    customerAddress,

    licenseNumber,
    licenseIssueDate,
    licenseCountry,
    licenseFrontPhotoUrl,
    licenseBackPhotoUrl,
    isUploadingPrimaryLicense,

    secondaryDriverFirstName,
    secondaryDriverLastName,
    secondaryDriverEmail,
    secondaryDriverPhone,
    secondaryLicenseNumber,
    secondaryLicenseIssueDate,
    secondaryLicenseCountry,
    secondaryLicenseFrontPhotoUrl,
    secondaryLicenseBackPhotoUrl,
    isUploadingSecondaryLicense,

    startDate,
    endDate,
    rentalPrice,
    pickupLocation,
    returnLocation,
    deliveryFee,

    signatureMode,
    termsAndConditions,

    errorMessage,
    isSubmitting,

    onSubmit,
    onCancel,

    setVehicleId,

    setCustomerFirstName,
    setCustomerLastName,
    setCustomerEmail,
    setCustomerPhone,
    setCustomerAddress,

    setLicenseNumber,
    setLicenseIssueDate,
    setLicenseCountry,

    setSecondaryDriverFirstName,
    setSecondaryDriverLastName,
    setSecondaryDriverEmail,
    setSecondaryDriverPhone,
    setSecondaryLicenseNumber,
    setSecondaryLicenseIssueDate,
    setSecondaryLicenseCountry,

    setStartDate,
    setEndDate,
    setRentalPrice,
    setPickupLocation,
    setReturnLocation,
    setDeliveryFee,

    setSignatureMode,
    setTermsAndConditions,

    onPrimaryFrontUpload,
    onPrimaryBackUpload,
    onSecondaryFrontUpload,
    onSecondaryBackUpload,
  } = props;

  return (
    <form className="contract-create-page__form" onSubmit={onSubmit}>
      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Contrat</h3>
          <p>Choisis le véhicule et prépare la base du dossier.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field">
            <span>Numéro de contrat</span>
            <p className="contract-create-page__helper">
  Le numéro de contrat sera généré automatiquement.
</p>
          </label>

          <label className="contract-create-page__field">
            <span>Véhicule</span>
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              required
              disabled={isLoadingVehicles}
            >
              <option value="">
                {isLoadingVehicles ? "Chargement des véhicules..." : "Choisir un véhicule"}
              </option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.plate_number})
                </option>
              ))}
            </select>
          </label>

          <label className="contract-create-page__field">
            <span>Mode de signature</span>
            <select
              value={signatureMode}
              onChange={(event) => setSignatureMode(event.target.value as SignatureMode)}
            >
              <option value="onsite">Sur place</option>
              <option value="external">Externe</option>
            </select>
          </label>
        </div>

        {selectedVehicle ? (
          <div className="contract-create-page__vehicle-preview">
            <div>
              <span>Véhicule sélectionné</span>
              <strong>
                {selectedVehicle.brand} {selectedVehicle.model}
              </strong>
            </div>

            <div>
              <span>Immatriculation</span>
              <strong>{selectedVehicle.plate_number}</strong>
            </div>

            <div>
              <span>Kilométrage</span>
              <strong>{selectedVehicle.current_mileage?.toLocaleString("fr-FR")} km</strong>
            </div>

            <div>
              <span>Caution véhicule</span>
              <strong>{readVehicleMoney(selectedVehicle, "deposit_amount")}</strong>
            </div>

            <div>
              <span>Franchise véhicule</span>
              <strong>{readVehicleMoney(selectedVehicle, "franchise_amount")}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Client principal</h3>
          <p>Informations du locataire principal.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field">
            <span>Prénom</span>
            <input
              type="text"
              value={customerFirstName}
              onChange={(event) => setCustomerFirstName(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Nom</span>
            <input
              type="text"
              value={customerLastName}
              onChange={(event) => setCustomerLastName(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Email</span>
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Téléphone</span>
            <input
              type="text"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field contract-create-page__field--full">
            <span>Adresse</span>
            <textarea
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              rows={3}
            />
          </label>
        </div>
      </section>

      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Permis principal</h3>
          <p>Données du permis principal avec recto et verso.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field">
            <span>Numéro de permis</span>
            <input
              type="text"
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Date de délivrance</span>
            <input
              type="date"
              value={licenseIssueDate}
              onChange={(event) => setLicenseIssueDate(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Pays du permis</span>
            <input
              type="text"
              value={licenseCountry}
              onChange={(event) => setLicenseCountry(event.target.value)}
              required
            />
          </label>

          <LicenseUploadField
            label="Permis principal - recto"
            isUploading={isUploadingPrimaryLicense}
            uploaded={Boolean(licenseFrontPhotoUrl)}
            emptyText="Prendre ou choisir la photo du recto."
            uploadedText="Recto enregistré."
            onChange={onPrimaryFrontUpload}
          />

          <LicenseUploadField
            label="Permis principal - verso"
            isUploading={isUploadingPrimaryLicense}
            uploaded={Boolean(licenseBackPhotoUrl)}
            emptyText="Prendre ou choisir la photo du verso."
            uploadedText="Verso enregistré."
            onChange={onPrimaryBackUpload}
          />
        </div>
      </section>

      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Conducteur secondaire</h3>
          <p>Optionnel. À remplir seulement si un second conducteur est autorisé.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field">
            <span>Prénom</span>
            <input
              type="text"
              value={secondaryDriverFirstName}
              onChange={(event) => setSecondaryDriverFirstName(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Nom</span>
            <input
              type="text"
              value={secondaryDriverLastName}
              onChange={(event) => setSecondaryDriverLastName(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Email</span>
            <input
              type="email"
              value={secondaryDriverEmail}
              onChange={(event) => setSecondaryDriverEmail(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Téléphone</span>
            <input
              type="text"
              value={secondaryDriverPhone}
              onChange={(event) => setSecondaryDriverPhone(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Numéro de permis</span>
            <input
              type="text"
              value={secondaryLicenseNumber}
              onChange={(event) => setSecondaryLicenseNumber(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Date de délivrance</span>
            <input
              type="date"
              value={secondaryLicenseIssueDate}
              onChange={(event) => setSecondaryLicenseIssueDate(event.target.value)}
            />
          </label>

          <label className="contract-create-page__field">
            <span>Pays du permis</span>
            <input
              type="text"
              value={secondaryLicenseCountry}
              onChange={(event) => setSecondaryLicenseCountry(event.target.value)}
            />
          </label>

          <LicenseUploadField
            label="Permis secondaire - recto"
            isUploading={isUploadingSecondaryLicense}
            uploaded={Boolean(secondaryLicenseFrontPhotoUrl)}
            emptyText="Optionnel."
            uploadedText="Recto enregistré."
            onChange={onSecondaryFrontUpload}
          />

          <LicenseUploadField
            label="Permis secondaire - verso"
            isUploading={isUploadingSecondaryLicense}
            uploaded={Boolean(secondaryLicenseBackPhotoUrl)}
            emptyText="Optionnel."
            uploadedText="Verso enregistré."
            onChange={onSecondaryBackUpload}
          />
        </div>
      </section>

      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Location</h3>
          <p>Dates, prix et modalités de remise / restitution.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field">
            <span>Date et heure de départ</span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Date et heure de retour</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Prix location (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rentalPrice}
              onChange={(event) => setRentalPrice(event.target.value)}
              placeholder="150"
              required
            />
          </label>

          <label className="contract-create-page__field">
            <span>Frais de livraison (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(event) => setDeliveryFee(event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="contract-create-page__field contract-create-page__field--full">
            <span>Lieu de remise</span>
            <textarea
              value={pickupLocation}
              onChange={(event) => setPickupLocation(event.target.value)}
              rows={2}
              placeholder="Exemple : 15 rue de Rivoli, Paris"
            />
          </label>

          <label className="contract-create-page__field contract-create-page__field--full">
            <span>Lieu de restitution</span>
            <textarea
              value={returnLocation}
              onChange={(event) => setReturnLocation(event.target.value)}
              rows={2}
              placeholder="Exemple : Gare de Lyon, Paris"
            />
          </label>
        </div>
      </section>

      <section className="contract-create-page__section">
        <div className="contract-create-page__section-header">
          <h3>Conditions</h3>
          <p>Bloc libre pour les conditions ou remarques spécifiques.</p>
        </div>

        <div className="contract-create-page__grid">
          <label className="contract-create-page__field contract-create-page__field--full">
            <span>Conditions générales / remarques</span>
            <textarea
              value={termsAndConditions}
              onChange={(event) => setTermsAndConditions(event.target.value)}
              rows={6}
              placeholder="Exemple : véhicule rendu avec le même niveau de carburant, franchise applicable..."
            />
          </label>
        </div>
      </section>

      {errorMessage ? <p className="contract-create-page__error">{errorMessage}</p> : null}

      <div className="contract-create-page__actions">
        <button
          type="button"
          className="contract-create-page__secondary-button"
          onClick={onCancel}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="contract-create-page__primary-button"
          disabled={
            isSubmitting ||
            isLoadingVehicles ||
            isUploadingPrimaryLicense ||
            isUploadingSecondaryLicense
          }
        >
          {isSubmitting ? "Création..." : "Créer le contrat"}
        </button>
      </div>
    </form>
  );
}

export default ContractCreateForm;