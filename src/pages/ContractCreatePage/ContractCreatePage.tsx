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

  const [contractNumber, setContractNumber] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const [contractSource, setContractSource] = useState("internal");
  const [otherProviderName, setOtherProviderName] = useState("");
  const [externalPlatformReference, setExternalPlatformReference] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [externalStartMileage, setExternalStartMileage] = useState("");
  const [externalEndMileage, setExternalEndMileage] = useState("");

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

  const isExternalContract = contractSource !== "internal";

  function getFinalContractSource(): string {
    if (contractSource === "other") {
      return otherProviderName.trim() || "other";
    }

    return contractSource;
  }

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

  async function uploadPrimary(file: File, setter: (url: string) => void) {
    try {
      setErrorMessage("");
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
      setErrorMessage("");
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

    if (!startDate || !endDate) {
      setErrorMessage("Renseigne les dates de location.");
      return;
    }

    if (contractSource === "other" && !otherProviderName.trim()) {
      setErrorMessage("Renseigne le nom du prestataire.");
      return;
    }

    if (!isExternalContract && !customerFirstName.trim()) {
      setErrorMessage("Renseigne le prénom du client.");
      return;
    }

    if (!isExternalContract && !customerLastName.trim()) {
      setErrorMessage("Renseigne le nom du client.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const rentalPriceValue = Number(rentalPrice || 0);
      const platformFeeValue = Number(platformFee || 0);

      const contract = await createContract({
        contract_number: contractNumber.trim() || `TEMP-${Date.now()}`,
        vehicle_id: Number(vehicleId),

        source: getFinalContractSource(),
        is_external: isExternalContract,
        external_platform_reference: externalPlatformReference.trim() || undefined,
        platform_fee: isExternalContract ? platformFeeValue : undefined,
        net_revenue: isExternalContract ? rentalPriceValue - platformFeeValue : undefined,
        external_start_mileage: externalStartMileage ? Number(externalStartMileage) : undefined,
        external_end_mileage: externalEndMileage ? Number(externalEndMileage) : undefined,

        customer_first_name: customerFirstName.trim() || (isExternalContract ? "Client" : ""),
        customer_last_name: customerLastName.trim() || (isExternalContract ? getFinalContractSource() : ""),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        customer_address: customerAddress.trim() || undefined,

        license_number: isExternalContract ? undefined : licenseNumber.trim() || undefined,
        license_issue_date: isExternalContract ? undefined : licenseIssueDate || undefined,
        license_country: isExternalContract ? undefined : licenseCountry.trim() || undefined,
        license_front_photo_url: isExternalContract ? undefined : licenseFrontPhotoUrl || undefined,
        license_back_photo_url: isExternalContract ? undefined : licenseBackPhotoUrl || undefined,

        secondary_driver_first_name: isExternalContract ? undefined : secondaryDriverFirstName.trim() || undefined,
        secondary_driver_last_name: isExternalContract ? undefined : secondaryDriverLastName.trim() || undefined,
        secondary_driver_email: isExternalContract ? undefined : secondaryDriverEmail.trim() || undefined,
        secondary_driver_phone: isExternalContract ? undefined : secondaryDriverPhone.trim() || undefined,
        secondary_license_number: isExternalContract ? undefined : secondaryLicenseNumber.trim() || undefined,
        secondary_license_issue_date: isExternalContract ? undefined : secondaryLicenseIssueDate || undefined,
        secondary_license_country: isExternalContract ? undefined : secondaryLicenseCountry.trim() || undefined,
        secondary_license_front_photo_url: isExternalContract ? undefined : secondaryLicenseFrontPhotoUrl || undefined,
        secondary_license_back_photo_url: isExternalContract ? undefined : secondaryLicenseBackPhotoUrl || undefined,

        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),

        rental_price: rentalPriceValue,
        pickup_location: pickupLocation.trim() || undefined,
        return_location: returnLocation.trim() || undefined,
        delivery_fee: deliveryFee ? Number(deliveryFee) : undefined,

        status: isExternalContract ? "signed" : "draft",
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
          Contrat interne complet ou contrat externe simplifié pour Roadstr, Turo ou autre prestataire.
        </p>
      </header>

      <ContractCreateForm
        contractNumber={contractNumber}
        setContractNumber={setContractNumber}

        contractSource={contractSource}
        otherProviderName={otherProviderName}
        externalPlatformReference={externalPlatformReference}
        platformFee={platformFee}
        externalStartMileage={externalStartMileage}
        externalEndMileage={externalEndMileage}
        isExternalContract={isExternalContract}
        setContractSource={setContractSource}
        setOtherProviderName={setOtherProviderName}
        setExternalPlatformReference={setExternalPlatformReference}
        setPlatformFee={setPlatformFee}
        setExternalStartMileage={setExternalStartMileage}
        setExternalEndMileage={setExternalEndMileage}

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

        onPrimaryFrontUpload={(event) =>
          event.target.files?.[0] &&
          uploadPrimary(event.target.files[0], setLicenseFrontPhotoUrl)
        }
        onPrimaryBackUpload={(event) =>
          event.target.files?.[0] &&
          uploadPrimary(event.target.files[0], setLicenseBackPhotoUrl)
        }
        onSecondaryFrontUpload={(event) =>
          event.target.files?.[0] &&
          uploadSecondary(event.target.files[0], setSecondaryLicenseFrontPhotoUrl)
        }
        onSecondaryBackUpload={(event) =>
          event.target.files?.[0] &&
          uploadSecondary(event.target.files[0], setSecondaryLicenseBackPhotoUrl)
        }
      />
    </section>
  );
}

export default ContractCreatePage;
