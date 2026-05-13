import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { downloadCheckPdf } from "../../api/checkApi";
import {
  getContractById,
  getContractClosure,
  updateContract,
} from "../../api/contractApi";
import { uploadLicensePhoto } from "../../api/uploadApi";
import type { RentalContract } from "../../types/contract";
import "./ContractDetailPage.css";

function formatStatus(status: RentalContract["status"]): string {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "signed":
      return "Signé";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("fr-FR");
}

function formatMoney(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "-";

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "-";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(numericValue);
}

function formatSource(contract: RentalContract): string {
  if (!contract.is_external) return "Interne";

  const source = String(contract.source || "").trim();

  if (source === "roadstr") return "Roadstr";
  if (source === "turo") return "Turo";
  if (source === "other") return "Autre";

  return source || "Externe";
}

function hasSecondaryDriver(contract: RentalContract): boolean {
  return Boolean(
    contract.secondary_driver_first_name ||
      contract.secondary_driver_last_name ||
      contract.secondary_license_number ||
      contract.secondary_license_front_photo_url ||
      contract.secondary_license_back_photo_url,
  );
}

function ContractDetailPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingLicense, setIsSavingLicense] = useState(false);
  const [isSavingSecondaryDriver, setIsSavingSecondaryDriver] = useState(false);
  const [isUploadingPrimaryLicense, setIsUploadingPrimaryLicense] = useState(false);
  const [isUploadingSecondaryLicense, setIsUploadingSecondaryLicense] = useState(false);

  const [isEditingLicense, setIsEditingLicense] = useState(false);
  const [isEditingSecondaryDriver, setIsEditingSecondaryDriver] = useState(false);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("France");
  const [licenseFrontPhotoUrl, setLicenseFrontPhotoUrl] = useState("");
  const [licenseBackPhotoUrl, setLicenseBackPhotoUrl] = useState("");

  const [secondaryDriverFirstName, setSecondaryDriverFirstName] = useState("");
  const [secondaryDriverLastName, setSecondaryDriverLastName] = useState("");
  const [secondaryLicenseNumber, setSecondaryLicenseNumber] = useState("");
  const [secondaryLicenseIssueDate, setSecondaryLicenseIssueDate] = useState("");
  const [secondaryLicenseCountry, setSecondaryLicenseCountry] = useState("France");
  const [secondaryLicenseFrontPhotoUrl, setSecondaryLicenseFrontPhotoUrl] = useState("");
  const [secondaryLicenseBackPhotoUrl, setSecondaryLicenseBackPhotoUrl] = useState("");

  useEffect(() => {
    async function loadContract() {
      if (!contractId) {
        setErrorMessage("Contrat introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getContractById(Number(contractId));

        try {
          const closure = await getContractClosure(Number(contractId));

          if (closure.status === "closed") {
            navigate(`/contracts/${contractId}/close`, { replace: true });
            return;
          }
        } catch {
          // Pas de clôture enregistrée, on reste sur la page détail du contrat.
        }

        setContract(data);
      } catch {
        setErrorMessage("Impossible de charger le contrat.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadContract();
  }, [contractId, navigate]);

  useEffect(() => {
    if (!contract) return;

    setLicenseNumber(contract.license_number || "");
    setLicenseIssueDate(contract.license_issue_date || "");
    setLicenseCountry(contract.license_country || "France");
    setLicenseFrontPhotoUrl(contract.license_front_photo_url || "");
    setLicenseBackPhotoUrl(contract.license_back_photo_url || "");

    setSecondaryDriverFirstName(contract.secondary_driver_first_name || "");
    setSecondaryDriverLastName(contract.secondary_driver_last_name || "");
    setSecondaryLicenseNumber(contract.secondary_license_number || "");
    setSecondaryLicenseIssueDate(contract.secondary_license_issue_date || "");
    setSecondaryLicenseCountry(contract.secondary_license_country || "France");
    setSecondaryLicenseFrontPhotoUrl(contract.secondary_license_front_photo_url || "");
    setSecondaryLicenseBackPhotoUrl(contract.secondary_license_back_photo_url || "");
  }, [contract]);

  const departureCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "departure") ?? null;
  }, [contract]);

  const returnCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "return") ?? null;
  }, [contract]);

  async function refreshContract() {
    if (!contractId) return;

    const data = await getContractById(Number(contractId));
    setContract(data);
  }

  async function handleUploadPrimaryLicense(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsUploadingPrimaryLicense(true);

      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage("Erreur pendant l’upload du permis principal.");
    } finally {
      setIsUploadingPrimaryLicense(false);
    }
  }

  async function handleUploadSecondaryLicense(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsUploadingSecondaryLicense(true);

      const result = await uploadLicensePhoto(file);
      setter(result.file_url);
    } catch {
      setErrorMessage("Erreur pendant l’upload du permis secondaire.");
    } finally {
      setIsUploadingSecondaryLicense(false);
    }
  }

  async function handleSaveLicense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contract) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSavingLicense(true);

      const updatedContract = await updateContract(contract.id, {
        contract_number: contract.contract_number,
        license_number: licenseNumber.trim() || undefined,
        license_issue_date: licenseIssueDate || undefined,
        license_country: licenseCountry.trim() || undefined,
        license_front_photo_url: licenseFrontPhotoUrl || undefined,
        license_back_photo_url: licenseBackPhotoUrl || undefined,
      });

      setContract(updatedContract);
      setIsEditingLicense(false);
      setSuccessMessage("Permis principal mis à jour.");
    } catch {
      setErrorMessage("Impossible de mettre à jour le permis principal.");
    } finally {
      setIsSavingLicense(false);
    }
  }

  async function handleSaveSecondaryDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contract) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSavingSecondaryDriver(true);

      const updatedContract = await updateContract(contract.id, {
        contract_number: contract.contract_number,
        secondary_driver_first_name: secondaryDriverFirstName.trim() || undefined,
        secondary_driver_last_name: secondaryDriverLastName.trim() || undefined,
        secondary_license_number: secondaryLicenseNumber.trim() || undefined,
        secondary_license_issue_date: secondaryLicenseIssueDate || undefined,
        secondary_license_country: secondaryLicenseCountry.trim() || undefined,
        secondary_license_front_photo_url: secondaryLicenseFrontPhotoUrl || undefined,
        secondary_license_back_photo_url: secondaryLicenseBackPhotoUrl || undefined,
      });

      setContract(updatedContract);
      setIsEditingSecondaryDriver(false);
      setSuccessMessage("Conducteur secondaire mis à jour.");
    } catch {
      setErrorMessage("Impossible de mettre à jour le conducteur secondaire.");
    } finally {
      setIsSavingSecondaryDriver(false);
    }
  }

  async function handleDownloadPdf(checkId: number) {
    try {
      setIsDownloadingPdf(true);
      setErrorMessage("");
      setSuccessMessage("");
      await downloadCheckPdf(checkId);
      await refreshContract();
    } catch {
      setErrorMessage("Impossible de télécharger le PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (isLoading) {
    return <p className="contract-detail-page__state">Chargement...</p>;
  }

  if (!contract) {
    return (
      <p className="contract-detail-page__state contract-detail-page__state--error">
        {errorMessage || "Contrat introuvable."}
      </p>
    );
  }

  const isExternalContract = Boolean(contract.is_external);
  const secondaryDriverExists = hasSecondaryDriver(contract);

  return (
    <section className="contract-detail-page">
      <header className="contract-detail-page__header">
        <div>
          <p className="contract-detail-page__eyebrow">
            {isExternalContract ? "Contrat externe" : "Contrat"}
          </p>
          <h2 className="contract-detail-page__title">{contract.contract_number}</h2>
        </div>

        <span className={`contract-detail-page__status contract-detail-page__status--${contract.status}`}>
          {formatStatus(contract.status)}
        </span>
      </header>

      <div className="contract-detail-page__grid">
        <article className="contract-detail-page__card">
          <h3>{isExternalContract ? "Client / réservation" : "Client principal"}</h3>
          <p>
            <strong>Nom :</strong> {contract.customer_first_name} {contract.customer_last_name}
          </p>
          <p>
            <strong>Email :</strong> {contract.customer_email || "-"}
          </p>
          <p>
            <strong>Téléphone :</strong> {contract.customer_phone || "-"}
          </p>
          <p>
            <strong>Adresse :</strong> {contract.customer_address || "-"}
          </p>
        </article>

        <article className="contract-detail-page__card">
          <h3>Véhicule</h3>
          <p>
            <strong>Modèle :</strong>{" "}
            {contract.vehicle
              ? `${contract.vehicle.brand} ${contract.vehicle.model}`
              : `Véhicule #${contract.vehicle_id}`}
          </p>
          <p>
            <strong>Immatriculation :</strong> {contract.vehicle?.plate_number || "-"}
          </p>
          <p>
            <strong>Kilométrage :</strong>{" "}
            {contract.vehicle?.current_mileage != null
              ? `${contract.vehicle.current_mileage.toLocaleString("fr-FR")} km`
              : "-"}
          </p>
        </article>

        <article className="contract-detail-page__card">
          <h3>Location</h3>
          <p>
            <strong>Départ :</strong> {formatDateTime(contract.start_date)}
          </p>
          <p>
            <strong>Retour :</strong> {formatDateTime(contract.end_date)}
          </p>
          <p>
            <strong>Prix :</strong> {formatMoney(contract.rental_price)}
          </p>
          <p>
            <strong>Type :</strong> {formatSource(contract)}
          </p>
        </article>

        <article className="contract-detail-page__card">
          <h3>{isExternalContract ? "Plateforme" : "Récap financier"}</h3>

          {isExternalContract ? (
            <>
              <p>
                <strong>Prestataire :</strong> {formatSource(contract)}
              </p>
              <p>
                <strong>Référence :</strong> {contract.external_platform_reference || "-"}
              </p>
              <p>
                <strong>Prix total prestation :</strong> {formatMoney(contract.rental_price)}
              </p>
              <p>
                <strong>Commission :</strong> {formatMoney(contract.platform_fee)}
              </p>
              <p>
                <strong>Revenu net :</strong> {formatMoney(contract.net_revenue)}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Caution :</strong> {formatMoney(contract.deposit_amount)}
              </p>
              <p>
                <strong>Franchise :</strong> {formatMoney(contract.franchise_amount)}
              </p>
              <p>
                <strong>Frais de livraison :</strong> {formatMoney(contract.delivery_fee)}
              </p>
            </>
          )}
        </article>

        {isExternalContract ? (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <h3>Kilométrage externe</h3>
            <p>
              <strong>Km départ :</strong>{" "}
              {contract.external_start_mileage != null
                ? `${contract.external_start_mileage.toLocaleString("fr-FR")} km`
                : "-"}
            </p>
            <p>
              <strong>Km retour :</strong>{" "}
              {contract.external_end_mileage != null
                ? `${contract.external_end_mileage.toLocaleString("fr-FR")} km`
                : "-"}
            </p>
            <p>
              <strong>Km parcourus :</strong>{" "}
              {contract.external_start_mileage != null && contract.external_end_mileage != null
                ? `${Math.max(
                    contract.external_end_mileage - contract.external_start_mileage,
                    0,
                  ).toLocaleString("fr-FR")} km`
                : "-"}
            </p>
          </article>
        ) : (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <div className="contract-detail-page__card-header">
              <h3>Permis principal</h3>

              <button
                type="button"
                className="contract-detail-page__secondary-button"
                onClick={() => setIsEditingLicense((current) => !current)}
              >
                {isEditingLicense
                  ? "Masquer"
                  : contract.license_number
                    ? "Modifier le permis"
                    : "Ajouter le permis"}
              </button>
            </div>

            {!isEditingLicense ? (
              <>
                <p>
                  <strong>Numéro :</strong> {contract.license_number || "-"}
                </p>
                <p>
                  <strong>Date de délivrance :</strong> {formatDate(contract.license_issue_date)}
                </p>
                <p>
                  <strong>Pays :</strong> {contract.license_country || "-"}
                </p>

                <div className="contract-detail-page__subgrid">
                  <div>
                    <p>
                      <strong>Recto</strong>
                    </p>
                    {contract.license_front_photo_url ? (
                      <div className="contract-detail-page__image-wrapper">
                        <img
                          src={contract.license_front_photo_url}
                          alt="Permis principal recto"
                          className="contract-detail-page__image"
                        />
                      </div>
                    ) : (
                      <p className="contract-detail-page__muted">Aucun recto.</p>
                    )}
                  </div>

                  <div>
                    <p>
                      <strong>Verso</strong>
                    </p>
                    {contract.license_back_photo_url ? (
                      <div className="contract-detail-page__image-wrapper">
                        <img
                          src={contract.license_back_photo_url}
                          alt="Permis principal verso"
                          className="contract-detail-page__image"
                        />
                      </div>
                    ) : (
                      <p className="contract-detail-page__muted">Aucun verso.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <form className="contract-detail-page__edit-form" onSubmit={handleSaveLicense}>
                <label className="contract-detail-page__field">
                  <span>Numéro de permis</span>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(event) => setLicenseNumber(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Date de délivrance</span>
                  <input
                    type="date"
                    value={licenseIssueDate}
                    onChange={(event) => setLicenseIssueDate(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Pays</span>
                  <input
                    type="text"
                    value={licenseCountry}
                    onChange={(event) => setLicenseCountry(event.target.value)}
                  />
                </label>

                <div className="contract-detail-page__subgrid">
                  <label className="contract-detail-page__field">
                    <span>Recto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        void handleUploadPrimaryLicense(event, setLicenseFrontPhotoUrl)
                      }
                    />
                    <small>
                      {isUploadingPrimaryLicense
                        ? "Upload en cours..."
                        : licenseFrontPhotoUrl
                          ? "Recto enregistré."
                          : "Aucun recto."}
                    </small>
                  </label>

                  <label className="contract-detail-page__field">
                    <span>Verso</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        void handleUploadPrimaryLicense(event, setLicenseBackPhotoUrl)
                      }
                    />
                    <small>
                      {isUploadingPrimaryLicense
                        ? "Upload en cours..."
                        : licenseBackPhotoUrl
                          ? "Verso enregistré."
                          : "Aucun verso."}
                    </small>
                  </label>
                </div>

                <div className="contract-detail-page__actions">
                  <button
                    type="submit"
                    className="contract-detail-page__primary-button"
                    disabled={isSavingLicense || isUploadingPrimaryLicense}
                  >
                    {isSavingLicense ? "Enregistrement..." : "Enregistrer le permis"}
                  </button>
                </div>
              </form>
            )}
          </article>
        )}

        <article className="contract-detail-page__card">
          <h3>Remise & restitution</h3>
          <p>
            <strong>Lieu de remise :</strong> {contract.pickup_location || "-"}
          </p>
          <p>
            <strong>Lieu de restitution :</strong> {contract.return_location || "-"}
          </p>
          <p>
            <strong>Créé le :</strong> {formatDateTime(contract.created_at)}
          </p>
          <p>
            <strong>Mis à jour le :</strong> {formatDateTime(contract.updated_at)}
          </p>
        </article>

        {!isExternalContract ? (
          <article className="contract-detail-page__card">
            <h3>États des lieux</h3>
            <p>
              <strong>Départ :</strong>{" "}
              {departureCheck ? `Check #${departureCheck.id} - ${departureCheck.status}` : "Non réalisé"}
            </p>
            <p>
              <strong>Retour :</strong>{" "}
              {returnCheck ? `Check #${returnCheck.id} - ${returnCheck.status}` : "Non réalisé"}
            </p>
          </article>
        ) : (
          <article className="contract-detail-page__card">
            <h3>Gestion</h3>
            <p className="contract-detail-page__muted">
              Contrat externe : pas d’état des lieux interne à réaliser. Va directement sur
              la page de gestion pour ajouter les frais et clôturer.
            </p>
          </article>
        )}

        {!isExternalContract ? (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <div className="contract-detail-page__card-header">
              <h3>Conducteur secondaire</h3>

              <button
                type="button"
                className="contract-detail-page__secondary-button"
                onClick={() => setIsEditingSecondaryDriver((current) => !current)}
              >
                {isEditingSecondaryDriver
                  ? "Masquer"
                  : secondaryDriverExists
                    ? "Modifier le conducteur secondaire"
                    : "Ajouter un conducteur secondaire"}
              </button>
            </div>

            {!isEditingSecondaryDriver ? (
              secondaryDriverExists ? (
                <>
                  <p>
                    <strong>Nom :</strong> {contract.secondary_driver_first_name || "-"}{" "}
                    {contract.secondary_driver_last_name || ""}
                  </p>
                  <p>
                    <strong>Permis :</strong> {contract.secondary_license_number || "-"}
                  </p>
                  <p>
                    <strong>Date de délivrance :</strong>{" "}
                    {formatDate(contract.secondary_license_issue_date)}
                  </p>
                  <p>
                    <strong>Pays permis :</strong> {contract.secondary_license_country || "-"}
                  </p>

                  <div className="contract-detail-page__subgrid">
                    <div>
                      <p>
                        <strong>Recto</strong>
                      </p>
                      {contract.secondary_license_front_photo_url ? (
                        <div className="contract-detail-page__image-wrapper">
                          <img
                            src={contract.secondary_license_front_photo_url}
                            alt="Permis secondaire recto"
                            className="contract-detail-page__image"
                          />
                        </div>
                      ) : (
                        <p className="contract-detail-page__muted">Aucun recto.</p>
                      )}
                    </div>

                    <div>
                      <p>
                        <strong>Verso</strong>
                      </p>
                      {contract.secondary_license_back_photo_url ? (
                        <div className="contract-detail-page__image-wrapper">
                          <img
                            src={contract.secondary_license_back_photo_url}
                            alt="Permis secondaire verso"
                            className="contract-detail-page__image"
                          />
                        </div>
                      ) : (
                        <p className="contract-detail-page__muted">Aucun verso.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="contract-detail-page__muted">
                  Aucun conducteur secondaire renseigné.
                </p>
              )
            ) : (
              <form
                className="contract-detail-page__edit-form"
                onSubmit={handleSaveSecondaryDriver}
              >
                <label className="contract-detail-page__field">
                  <span>Prénom</span>
                  <input
                    type="text"
                    value={secondaryDriverFirstName}
                    onChange={(event) => setSecondaryDriverFirstName(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Nom</span>
                  <input
                    type="text"
                    value={secondaryDriverLastName}
                    onChange={(event) => setSecondaryDriverLastName(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Numéro de permis</span>
                  <input
                    type="text"
                    value={secondaryLicenseNumber}
                    onChange={(event) => setSecondaryLicenseNumber(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Date de délivrance</span>
                  <input
                    type="date"
                    value={secondaryLicenseIssueDate}
                    onChange={(event) => setSecondaryLicenseIssueDate(event.target.value)}
                  />
                </label>

                <label className="contract-detail-page__field">
                  <span>Pays</span>
                  <input
                    type="text"
                    value={secondaryLicenseCountry}
                    onChange={(event) => setSecondaryLicenseCountry(event.target.value)}
                  />
                </label>

                <div className="contract-detail-page__subgrid">
                  <label className="contract-detail-page__field">
                    <span>Recto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        void handleUploadSecondaryLicense(
                          event,
                          setSecondaryLicenseFrontPhotoUrl,
                        )
                      }
                    />
                    <small>
                      {isUploadingSecondaryLicense
                        ? "Upload en cours..."
                        : secondaryLicenseFrontPhotoUrl
                          ? "Recto enregistré."
                          : "Aucun recto."}
                    </small>
                  </label>

                  <label className="contract-detail-page__field">
                    <span>Verso</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        void handleUploadSecondaryLicense(
                          event,
                          setSecondaryLicenseBackPhotoUrl,
                        )
                      }
                    />
                    <small>
                      {isUploadingSecondaryLicense
                        ? "Upload en cours..."
                        : secondaryLicenseBackPhotoUrl
                          ? "Verso enregistré."
                          : "Aucun verso."}
                    </small>
                  </label>
                </div>

                <div className="contract-detail-page__actions">
                  <button
                    type="submit"
                    className="contract-detail-page__primary-button"
                    disabled={isSavingSecondaryDriver || isUploadingSecondaryLicense}
                  >
                    {isSavingSecondaryDriver
                      ? "Enregistrement..."
                      : "Enregistrer le conducteur secondaire"}
                  </button>
                </div>
              </form>
            )}
          </article>
        ) : null}

        {contract.terms_and_conditions ? (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <h3>Conditions / remarques</h3>
            <p className="contract-detail-page__terms">{contract.terms_and_conditions}</p>
          </article>
        ) : null}
      </div>

      {successMessage ? (
        <p className="contract-detail-page__state">{successMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="contract-detail-page__state contract-detail-page__state--error">
          {errorMessage}
        </p>
      ) : null}

      <div className="contract-detail-page__actions">
        <Link to="/contracts" className="contract-detail-page__secondary-button">
          Retour contrats
        </Link>

        {isExternalContract ? (
          <Link
            to={`/contracts/${contract.id}/close`}
            className="contract-detail-page__primary-button"
          >
            Gérer / clôturer le contrat externe
          </Link>
        ) : (
          <>
            {departureCheck?.status === "completed" && returnCheck?.status === "completed" ? (
              <Link
                to={`/contracts/${contract.id}/close`}
                className="contract-detail-page__primary-button"
              >
                Clôturer le contrat
              </Link>
            ) : null}

            {!departureCheck ? (
              <Link
                to={`/contracts/${contract.id}/check?type=departure`}
                className="contract-detail-page__primary-button"
              >
                Faire l’état des lieux de départ
              </Link>
            ) : departureCheck.status !== "completed" ? (
              <Link
                to={`/contracts/${contract.id}/check?type=departure`}
                className="contract-detail-page__primary-button"
              >
                Reprendre l’état des lieux de départ
              </Link>
            ) : (
              <button
                type="button"
                className="contract-detail-page__primary-button"
                onClick={() => void handleDownloadPdf(departureCheck.id)}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? "Téléchargement..." : "Télécharger le PDF départ"}
              </button>
            )}

            {departureCheck?.status === "completed" && !returnCheck ? (
              <Link
                to={`/contracts/${contract.id}/check?type=return`}
                className="contract-detail-page__secondary-button"
              >
                Faire l’état des lieux de retour
              </Link>
            ) : null}

            {returnCheck && returnCheck.status !== "completed" ? (
              <Link
                to={`/contracts/${contract.id}/check?type=return`}
                className="contract-detail-page__secondary-button"
              >
                Reprendre l’état des lieux de retour
              </Link>
            ) : null}

            {returnCheck?.status === "completed" ? (
              <button
                type="button"
                className="contract-detail-page__secondary-button"
                onClick={() => void handleDownloadPdf(returnCheck.id)}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? "Téléchargement..." : "Télécharger le PDF retour"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export default ContractDetailPage;
