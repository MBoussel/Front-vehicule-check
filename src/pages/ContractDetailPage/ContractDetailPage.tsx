import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { downloadCheckPdf } from "../../api/checkApi";
import { getContractById } from "../../api/contractApi";
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

  return date.toLocaleString("fr-FR");
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

function hasSecondaryDriver(contract: RentalContract): boolean {
  return Boolean(
    contract.secondary_driver_first_name ||
      contract.secondary_driver_last_name ||
      contract.secondary_license_number,
  );
}

function ContractDetailPage() {
  const { contractId } = useParams();

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
        const data = await getContractById(Number(contractId));
        setContract(data);
      } catch {
        setErrorMessage("Impossible de charger le contrat.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadContract();
  }, [contractId]);

  const departureCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "departure") ?? null;
  }, [contract]);

  const returnCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "return") ?? null;
  }, [contract]);

  async function handleDownloadPdf(checkId: number) {
    try {
      setIsDownloadingPdf(true);
      setErrorMessage("");
      await downloadCheckPdf(checkId);
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

  const secondaryDriverExists = hasSecondaryDriver(contract);

  return (
    <section className="contract-detail-page">
      <header className="contract-detail-page__header">
        <div>
          <p className="contract-detail-page__eyebrow">Contrat</p>
          <h2 className="contract-detail-page__title">{contract.contract_number}</h2>
        </div>

        <span className={`contract-detail-page__status contract-detail-page__status--${contract.status}`}>
          {formatStatus(contract.status)}
        </span>
      </header>

      <div className="contract-detail-page__grid">
        <article className="contract-detail-page__card">
          <h3>Client principal</h3>
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
            <strong>Mode signature :</strong> {contract.signature_mode}
          </p>
        </article>

        <article className="contract-detail-page__card">
          <h3>Récap financier</h3>
          <p>
            <strong>Caution :</strong> {formatMoney(contract.deposit_amount)}
          </p>
          <p>
            <strong>Franchise :</strong> {formatMoney(contract.franchise_amount)}
          </p>
          <p>
            <strong>Frais de livraison :</strong> {formatMoney(contract.delivery_fee)}
          </p>
        </article>

        <article className="contract-detail-page__card contract-detail-page__card--full">
          <h3>Permis principal</h3>
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
        </article>

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

        {secondaryDriverExists ? (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <h3>Conducteur secondaire</h3>

            <p>
              <strong>Nom :</strong> {contract.secondary_driver_first_name || "-"}{" "}
              {contract.secondary_driver_last_name || ""}
            </p>
            <p>
              <strong>Email :</strong> {contract.secondary_driver_email || "-"}
            </p>
            <p>
              <strong>Téléphone :</strong> {contract.secondary_driver_phone || "-"}
            </p>
            <p>
              <strong>Permis :</strong> {contract.secondary_license_number || "-"}
            </p>
            <p>
              <strong>Date de délivrance :</strong> {formatDate(contract.secondary_license_issue_date)}
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
          </article>
        ) : null}

        {contract.terms_and_conditions ? (
          <article className="contract-detail-page__card contract-detail-page__card--full">
            <h3>Conditions / remarques</h3>
            <p className="contract-detail-page__terms">{contract.terms_and_conditions}</p>
          </article>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="contract-detail-page__state contract-detail-page__state--error">
          {errorMessage}
        </p>
      ) : null}

      <div className="contract-detail-page__actions">
        <Link to="/contracts" className="contract-detail-page__secondary-button">
          Retour contrats
        </Link>

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
      </div>
    </section>
  );
}

export default ContractDetailPage;