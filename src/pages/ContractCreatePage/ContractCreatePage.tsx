import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createContract } from "../../api/contractApi";
import { uploadLicensePhoto } from "../../api/uploadApi";
import { getVehicles } from "../../api/vehicleApi";
import ContractCreateForm from "../../components/contracts/ContractCreateForm";
import type { SignatureMode } from "../../types/contract";
import type { Vehicle } from "../../types/vehicle";
import "./ContractCreatePage.css";

function toDatetimeLocalValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function getTodayDate(): string {
  return toDatetimeLocalValue(new Date());
}

function getDefaultEndDate(): string {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  return toDatetimeLocalValue(currentDate);
}

function generateContractNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000 + 1000);

  return `CTR-${year}${month}${day}-${random}`;
}

function ContractCreatePage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  const [contractNumber, setContractNumber] = useState(generateContractNumber());
  const [vehicleId, setVehicleId] = useState("");

  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("France");
  const [licenseFrontPhotoUrl, setLicenseFrontPhotoUrl] = useState("");
  const [licenseBackPhotoUrl, setLicenseBackPhotoUrl] = useState("");
  const [isUploadingPrimaryLicense, setIsUploadingPrimaryLicense] = useState(false);

  const [secondaryDriverFirstName, setSecondaryDriverFirstName] = useState("");
  const [secondaryDriverLastName, setSecondaryDriverLastName] = useState("");
  const [secondaryDriverEmail, setSecondaryDriverEmail] = useState("");
  const [secondaryDriverPhone, setSecondaryDriverPhone] = useState("");
  const [secondaryLicenseNumber, setSecondaryLicenseNumber] = useState("");
  const [secondaryLicenseIssueDate, setSecondaryLicenseIssueDate] = useState("");
  const [secondaryLicenseCountry, setSecondaryLicenseCountry] = useState("France");
  const [secondaryLicenseFrontPhotoUrl, setSecondaryLicenseFrontPhotoUrl] = useState("");
  const [secondaryLicenseBackPhotoUrl, setSecondaryLicenseBackPhotoUrl] = useState("");
  const [isUploadingSecondaryLicense, setIsUploadingSecondaryLicense] = useState(false);

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [rentalPrice, setRentalPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");

  const [signatureMode, setSignatureMode] = useState<SignatureMode>("onsite");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        const data = await getVehicles();
        setVehicles(data);
      } catch {
        setErrorMessage("Impossible de charger les véhicules.");
      } finally {
        setIsLoadingVehicles(false);
      }
    }

    void loadVehicles();
  }, []);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((vehicle) => String(vehicle.id) === vehicleId) ?? null;
  }, [vehicleId, vehicles]);

  async function uploadPrimary(file: File, setter: (url: string) => void, errorText: string) {
    try {
      setErrorMessage("");
      setIsUploadingPrimaryLicense(true);
      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage(errorText);
    } finally {
      setIsUploadingPrimaryLicense(false);
    }
  }

  async function uploadSecondary(file: File, setter: (url: string) => void, errorText: string) {
    try {
      setErrorMessage("");
      setIsUploadingSecondaryLicense(true);
      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage(errorText);
    } finally {
      setIsUploadingSecondaryLicense(false);
    }
  }

  async function handlePrimaryFrontUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadPrimary(file, setLicenseFrontPhotoUrl, "Impossible d’uploader le recto du permis principal.");
  }

  async function handlePrimaryBackUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadPrimary(file, setLicenseBackPhotoUrl, "Impossible d’uploader le verso du permis principal.");
  }

  async function handleSecondaryFrontUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadSecondary(file, setSecondaryLicenseFrontPhotoUrl, "Impossible d’uploader le recto du permis secondaire.");
  }

  async function handleSecondaryBackUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadSecondary(file, setSecondaryLicenseBackPhotoUrl, "Impossible d’uploader le verso du permis secondaire.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleId) {
      setErrorMessage("Sélectionne un véhicule.");
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage("Renseigne les dates de location.");
      return;
    }

    if (!licenseFrontPhotoUrl || !licenseBackPhotoUrl) {
      setErrorMessage("Ajoute le recto et le verso du permis du conducteur principal.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const contract = await createContract({
        contract_number: contractNumber.trim(),
        vehicle_id: Number(vehicleId),

        customer_first_name: customerFirstName.trim(),
        customer_last_name: customerLastName.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        customer_address: customerAddress.trim() || undefined,

        license_number: licenseNumber.trim(),
        license_issue_date: licenseIssueDate || undefined,
        license_country: licenseCountry.trim() || undefined,
        license_front_photo_url: licenseFrontPhotoUrl || undefined,
        license_back_photo_url: licenseBackPhotoUrl || undefined,

        secondary_driver_first_name: secondaryDriverFirstName.trim() || undefined,
        secondary_driver_last_name: secondaryDriverLastName.trim() || undefined,
        secondary_driver_email: secondaryDriverEmail.trim() || undefined,
        secondary_driver_phone: secondaryDriverPhone.trim() || undefined,
        secondary_license_number: secondaryLicenseNumber.trim() || undefined,
        secondary_license_issue_date: secondaryLicenseIssueDate || undefined,
        secondary_license_country: secondaryLicenseCountry.trim() || undefined,
        secondary_license_front_photo_url: secondaryLicenseFrontPhotoUrl || undefined,
        secondary_license_back_photo_url: secondaryLicenseBackPhotoUrl || undefined,

        start_date: startDate,
        end_date: endDate,
        rental_price: Number(rentalPrice || 0),

        pickup_location: pickupLocation.trim() || undefined,
        return_location: returnLocation.trim() || undefined,
        delivery_fee: deliveryFee ? Number(deliveryFee) : undefined,

        status: "draft",
        signature_mode: signatureMode,
        terms_and_conditions: termsAndConditions.trim() || undefined,
      });

      navigate(`/contracts/${contract.id}`);
    } catch {
      setErrorMessage("Impossible de créer le contrat.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="contract-create-page">
      <header className="contract-create-page__header">
        <div>
          <p className="contract-create-page__eyebrow">Contrats</p>
          <h2 className="contract-create-page__title">Créer un contrat</h2>
        </div>

        <p className="contract-create-page__description">
          Formulaire contrat avec véhicule, client, permis recto/verso, livraison et conducteur secondaire.
        </p>
      </header>

      <ContractCreateForm
        contractNumber={contractNumber}
        vehicleId={vehicleId}
        vehicles={vehicles}
        isLoadingVehicles={isLoadingVehicles}
        selectedVehicle={selectedVehicle}
        customerFirstName={customerFirstName}
        customerLastName={customerLastName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        licenseNumber={licenseNumber}
        licenseIssueDate={licenseIssueDate}
        licenseCountry={licenseCountry}
        licenseFrontPhotoUrl={licenseFrontPhotoUrl}
        licenseBackPhotoUrl={licenseBackPhotoUrl}
        isUploadingPrimaryLicense={isUploadingPrimaryLicense}
        secondaryDriverFirstName={secondaryDriverFirstName}
        secondaryDriverLastName={secondaryDriverLastName}
        secondaryDriverEmail={secondaryDriverEmail}
        secondaryDriverPhone={secondaryDriverPhone}
        secondaryLicenseNumber={secondaryLicenseNumber}
        secondaryLicenseIssueDate={secondaryLicenseIssueDate}
        secondaryLicenseCountry={secondaryLicenseCountry}
        secondaryLicenseFrontPhotoUrl={secondaryLicenseFrontPhotoUrl}
        secondaryLicenseBackPhotoUrl={secondaryLicenseBackPhotoUrl}
        isUploadingSecondaryLicense={isUploadingSecondaryLicense}
        startDate={startDate}
        endDate={endDate}
        rentalPrice={rentalPrice}
        pickupLocation={pickupLocation}
        returnLocation={returnLocation}
        deliveryFee={deliveryFee}
        signatureMode={signatureMode}
        termsAndConditions={termsAndConditions}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/contracts")}
        setContractNumber={setContractNumber}
        setVehicleId={setVehicleId}
        setCustomerFirstName={setCustomerFirstName}
        setCustomerLastName={setCustomerLastName}
        setCustomerEmail={setCustomerEmail}
        setCustomerPhone={setCustomerPhone}
        setCustomerAddress={setCustomerAddress}
        setLicenseNumber={setLicenseNumber}
        setLicenseIssueDate={setLicenseIssueDate}
        setLicenseCountry={setLicenseCountry}
        setSecondaryDriverFirstName={setSecondaryDriverFirstName}
        setSecondaryDriverLastName={setSecondaryDriverLastName}
        setSecondaryDriverEmail={setSecondaryDriverEmail}
        setSecondaryDriverPhone={setSecondaryDriverPhone}
        setSecondaryLicenseNumber={setSecondaryLicenseNumber}
        setSecondaryLicenseIssueDate={setSecondaryLicenseIssueDate}
        setSecondaryLicenseCountry={setSecondaryLicenseCountry}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setRentalPrice={setRentalPrice}
        setPickupLocation={setPickupLocation}
        setReturnLocation={setReturnLocation}
        setDeliveryFee={setDeliveryFee}
        setSignatureMode={setSignatureMode}
        setTermsAndConditions={setTermsAndConditions}
        onPrimaryFrontUpload={handlePrimaryFrontUpload}
        onPrimaryBackUpload={handlePrimaryBackUpload}
        onSecondaryFrontUpload={handleSecondaryFrontUpload}
        onSecondaryBackUpload={handleSecondaryBackUpload}
      />
    </section>
  );
}

export default ContractCreatePage;