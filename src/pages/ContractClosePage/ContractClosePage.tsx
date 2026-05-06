import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { downloadCheckPdf } from "../../api/checkApi";
import {
  createContractClosure,
  getContractById,
  getContractClosure,
  updateContractClosure,
} from "../../api/contractApi";
import type { ContractClosure, RentalContract } from "../../types/contract";
import "./ContractClosePage.css";

function toNumber(value?: number | string | null): number {
  if (value === null || value === undefined || value === "") return 0;
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function formatMoney(value?: number | string | null): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(toNumber(value));
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  const cleanValue = value
    .replace("T", " ")
    .replace("+00:00", "")
    .replace("+00", "");

  const [datePart, timePart] = cleanValue.split(" ");
  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function ContractClosePage() {
  const { contractId } = useParams();

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [closure, setClosure] = useState<ContractClosure | null>(null);

  const [extraKmFee, setExtraKmFee] = useState("");
  const [fuelFee, setFuelFee] = useState("");
  const [cleaningFee, setCleaningFee] = useState("");
  const [damageFee, setDamageFee] = useState("");
  const [otherFee, setOtherFee] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const departureCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "departure") ?? null;
  }, [contract]);

  const returnCheck = useMemo(() => {
    return contract?.checks?.find((check) => check.type_check === "return") ?? null;
  }, [contract]);

  const canCloseContract =
    departureCheck?.status === "completed" && returnCheck?.status === "completed";

  const previewTotal = useMemo(() => {
    if (!closure) return 0;

    return (
      toNumber(closure.rental_price) +
      toNumber(extraKmFee) +
      toNumber(fuelFee) +
      toNumber(cleaningFee) +
      toNumber(damageFee) +
      toNumber(otherFee) -
      toNumber(discountAmount)
    );
  }, [
    closure,
    extraKmFee,
    fuelFee,
    cleaningFee,
    damageFee,
    otherFee,
    discountAmount,
  ]);

  function fillForm(data: ContractClosure) {
    setExtraKmFee(String(data.extra_km_fee ?? 0));
    setFuelFee(String(data.fuel_fee ?? 0));
    setCleaningFee(String(data.cleaning_fee ?? 0));
    setDamageFee(String(data.damage_fee ?? 0));
    setOtherFee(String(data.other_fee ?? 0));
    setDiscountAmount(String(data.discount_amount ?? 0));
    setNotes(data.notes || "");
  }

  useEffect(() => {
    async function loadData() {
      if (!contractId) {
        setErrorMessage("Contrat introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const contractData = await getContractById(Number(contractId));
        setContract(contractData);

        const departure = contractData.checks?.find(
          (check) => check.type_check === "departure",
        );
        const returnState = contractData.checks?.find(
          (check) => check.type_check === "return",
        );

        const hasCompletedChecks =
          departure?.status === "completed" && returnState?.status === "completed";

        if (!hasCompletedChecks) {
          setIsLoading(false);
          return;
        }

        try {
          const closureData = await getContractClosure(Number(contractId));
          setClosure(closureData);
          fillForm(closureData);
        } catch {
          const createdClosure = await createContractClosure(Number(contractId), {
            status: "draft",
          });

          setClosure(createdClosure);
          fillForm(createdClosure);
        }
      } catch {
        setErrorMessage("Impossible de charger la clôture du contrat.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [contractId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contractId) return;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        extra_km_fee: toNumber(extraKmFee),
        fuel_fee: toNumber(fuelFee),
        cleaning_fee: toNumber(cleaningFee),
        damage_fee: toNumber(damageFee),
        other_fee: toNumber(otherFee),
        discount_amount: toNumber(discountAmount),
        notes: notes.trim(),
        status: "draft" as const,
      };

      const updatedClosure = closure
        ? await updateContractClosure(Number(contractId), payload)
        : await createContractClosure(Number(contractId), payload);

      setClosure(updatedClosure);
      fillForm(updatedClosure);
      setSuccessMessage("Clôture enregistrée.");
    } catch {
      setErrorMessage("Impossible d’enregistrer la clôture.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidateClosure() {
    if (!contractId) return;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedClosure = await updateContractClosure(Number(contractId), {
        extra_km_fee: toNumber(extraKmFee),
        fuel_fee: toNumber(fuelFee),
        cleaning_fee: toNumber(cleaningFee),
        damage_fee: toNumber(damageFee),
        other_fee: toNumber(otherFee),
        discount_amount: toNumber(discountAmount),
        notes: notes.trim(),
        status: "closed",
      });

      setClosure(updatedClosure);
      fillForm(updatedClosure);
      setSuccessMessage("Contrat clôturé.");
    } catch {
      setErrorMessage("Impossible de clôturer le contrat.");
    } finally {
      setIsSaving(false);
    }
  }

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
    return <p className="contract-close-page__state">Chargement...</p>;
  }

  if (!contract) {
    return (
      <p className="contract-close-page__state contract-close-page__state--error">
        {errorMessage || "Contrat introuvable."}
      </p>
    );
  }

  if (!canCloseContract) {
    return (
      <section className="contract-close-page">
        <div className="contract-close-page__state contract-close-page__state--error">
          Il faut terminer l’état des lieux de départ et l’état des lieux de retour avant
          de clôturer ce contrat.
        </div>

        <Link
          to={`/contracts/${contract.id}`}
          className="contract-close-page__secondary-button"
        >
          Retour au contrat
        </Link>
      </section>
    );
  }

  return (
    <section className="contract-close-page">
      <header className="contract-close-page__header">
        <div>
          <p className="contract-close-page__eyebrow">Clôture contrat</p>
          <h2 className="contract-close-page__title">{contract.contract_number}</h2>
          <p className="contract-close-page__description">
            Récapitulatif final de la location, kilométrage et frais additionnels.
          </p>
        </div>

        <span className="contract-close-page__status">
          {closure?.status === "closed" ? "Clôturé" : "Brouillon"}
        </span>
      </header>

      <div className="contract-close-page__grid">
        <article className="contract-close-page__card">
          <h3>Location</h3>
          <p>
            <strong>Client :</strong> {contract.customer_first_name}{" "}
            {contract.customer_last_name}
          </p>
          <p>
            <strong>Véhicule :</strong>{" "}
            {contract.vehicle
              ? `${contract.vehicle.brand} ${contract.vehicle.model}`
              : `Véhicule #${contract.vehicle_id}`}
          </p>
          <p>
            <strong>Départ :</strong> {formatDateTime(contract.start_date)}
          </p>
          <p>
            <strong>Retour :</strong> {formatDateTime(contract.end_date)}
          </p>
          <p>
            <strong>Durée :</strong> {closure?.rental_days ?? "-"} jour(s)
          </p>
        </article>

        <article className="contract-close-page__card">
          <h3>Kilométrage</h3>
          <p>
            <strong>Km départ :</strong> {closure?.departure_mileage ?? "-"} km
          </p>
          <p>
            <strong>Km retour :</strong> {closure?.return_mileage ?? "-"} km
          </p>
          <p>
            <strong>Km effectués :</strong> {closure?.driven_km ?? "-"} km
          </p>
          <p>
            <strong>Km inclus :</strong> {closure?.included_km ?? "-"} km
          </p>
          <p>
            <strong>Dépassement :</strong> {closure?.extra_km ?? "-"} km
          </p>
        </article>

        <article className="contract-close-page__card">
          <h3>PDF</h3>

          {departureCheck ? (
            <button
              type="button"
              className="contract-close-page__secondary-button"
              onClick={() => void handleDownloadPdf(departureCheck.id)}
              disabled={isDownloadingPdf}
            >
              Télécharger PDF départ
            </button>
          ) : null}

          {returnCheck ? (
            <button
              type="button"
              className="contract-close-page__secondary-button"
              onClick={() => void handleDownloadPdf(returnCheck.id)}
              disabled={isDownloadingPdf}
            >
              Télécharger PDF retour
            </button>
          ) : null}
        </article>

        <article className="contract-close-page__card">
          <h3>Total</h3>
          <p>
            <strong>Prix location :</strong> {formatMoney(closure?.rental_price)}
          </p>
          <p>
            <strong>Total final :</strong>{" "}
            <span className="contract-close-page__total">
              {formatMoney(previewTotal)}
            </span>
          </p>
        </article>
      </div>

      <form className="contract-close-page__form" onSubmit={handleSave}>
        <h3>Frais additionnels</h3>

        <div className="contract-close-page__form-grid">
          <label className="contract-close-page__field">
            <span>Frais km supplémentaire (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={extraKmFee}
              onChange={(event) => setExtraKmFee(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field">
            <span>Frais carburant (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fuelFee}
              onChange={(event) => setFuelFee(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field">
            <span>Frais nettoyage (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cleaningFee}
              onChange={(event) => setCleaningFee(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field">
            <span>Frais dommages (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={damageFee}
              onChange={(event) => setDamageFee(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field">
            <span>Autres frais (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={otherFee}
              onChange={(event) => setOtherFee(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field">
            <span>Remise commerciale (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(event) => setDiscountAmount(event.target.value)}
            />
          </label>

          <label className="contract-close-page__field contract-close-page__field--full">
            <span>Notes</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Exemple : nettoyage intérieur facturé, carburant rendu à moitié..."
            />
          </label>
        </div>

        <div className="contract-close-page__actions">
          <Link
            to={`/contracts/${contract.id}`}
            className="contract-close-page__secondary-button"
          >
            Retour au contrat
          </Link>

          <button
            type="submit"
            className="contract-close-page__secondary-button"
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="contract-close-page__primary-button"
            onClick={() => void handleValidateClosure()}
            disabled={isSaving}
          >
            Valider la clôture
          </button>
        </div>
      </form>

      {successMessage ? (
        <p className="contract-close-page__state">{successMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="contract-close-page__state contract-close-page__state--error">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

export default ContractClosePage;