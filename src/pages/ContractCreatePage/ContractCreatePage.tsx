import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
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

function ContractCreatePage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // ⚠️ IMPORTANT : on garde le setter
  const [contractNumber, setContractNumber] = useState("");

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
    return vehicles.find((v) => String(v.id) === vehicleId) ?? null;
  }, [vehicleId, vehicles]);

  async function uploadPrimary(file: File, setter: (url: string) => void) {
    try {
      setIsUploadingPrimaryLicense(true);
      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage("Erreur upload permis principal.");
    } finally {
      setIsUploadingPrimaryLicense(false);
    }
  }

  async function uploadSecondary(file: File, setter: (url: string) => void) {
    try {
      setIsUploadingSecondaryLicense(true);
      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage("Erreur upload permis secondaire.");
    } finally {
      setIsUploadingSecondaryLicense(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleId) {
      setErrorMessage("Sélectionne un véhicule.");
      return;
    }

    if (!licenseFrontPhotoUrl || !licenseBackPhotoUrl) {
      setErrorMessage("Ajoute le permis principal.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const contract = await createContract({
        contract_number: contractNumber || `TEMP-${Date.now()}`, // temp fallback

        vehicle_id: Number(vehicleId),

        customer_first_name: customerFirstName.trim(),
        customer_last_name: customerLastName.trim(),

        license_number: licenseNumber.trim(),
        license_front_photo_url: licenseFrontPhotoUrl,
        license_back_photo_url: licenseBackPhotoUrl,

        start_date: startDate,
        end_date: endDate,
        rental_price: Number(rentalPrice || 0),

        pickup_location: pickupLocation,
        return_location: returnLocation,

        status: "draft",
        signature_mode: signatureMode,
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
      <h2>Créer un contrat</h2>

      <ContractCreateForm
        contractNumber={contractNumber}
        setContractNumber={setContractNumber} // ✅ FIX ICI

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

        onPrimaryFrontUpload={(e) =>
          e.target.files?.[0] &&
          uploadPrimary(e.target.files[0], setLicenseFrontPhotoUrl)
        }
        onPrimaryBackUpload={(e) =>
          e.target.files?.[0] &&
          uploadPrimary(e.target.files[0], setLicenseBackPhotoUrl)
        }
        onSecondaryFrontUpload={(e) =>
          e.target.files?.[0] &&
          uploadSecondary(e.target.files[0], setSecondaryLicenseFrontPhotoUrl)
        }
        onSecondaryBackUpload={(e) =>
          e.target.files?.[0] &&
          uploadSecondary(e.target.files[0], setSecondaryLicenseBackPhotoUrl)
        }
      />
    </section>
  );
}

export default ContractCreatePage;