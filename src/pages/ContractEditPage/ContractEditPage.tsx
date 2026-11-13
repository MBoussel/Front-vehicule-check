import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getContractById, updateContract } from "../../api/contractApi";
import { getVehicles } from "../../api/vehicleApi";
import type { RentalContract, RentalContractCreatePayload } from "../../types/contract";
import type { Vehicle } from "../../types/vehicle";
import "./ContractEditPage.css";

type EditValues = Record<string, string>;

function toLocalDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function ContractEditPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [values, setValues] = useState<EditValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!contractId) {
        setError("Contrat introuvable.");
        setIsLoading(false);
        return;
      }
      try {
        const [loadedContract, loadedVehicles] = await Promise.all([
          getContractById(Number(contractId)),
          getVehicles(),
        ]);
        if (!active) return;
        setContract(loadedContract);
        setVehicles(loadedVehicles);
        setValues({
          contract_number: loadedContract.contract_number || "",
          vehicle_id: String(loadedContract.vehicle_id),
          source: loadedContract.source || (loadedContract.is_external ? "other" : "internal"),
          external_platform_reference: loadedContract.external_platform_reference || "",
          platform_fee: String(loadedContract.platform_fee ?? ""),
          net_revenue: String(loadedContract.net_revenue ?? ""),
          external_start_mileage: String(loadedContract.external_start_mileage ?? ""),
          external_end_mileage: String(loadedContract.external_end_mileage ?? ""),
          customer_first_name: loadedContract.customer_first_name || "",
          customer_last_name: loadedContract.customer_last_name || "",
          customer_email: loadedContract.customer_email || "",
          customer_phone: loadedContract.customer_phone || "",
          customer_address: loadedContract.customer_address || "",
          license_number: loadedContract.license_number || "",
          license_issue_date: loadedContract.license_issue_date || "",
          license_country: loadedContract.license_country || "",
          license_front_photo_url: loadedContract.license_front_photo_url || "",
          license_back_photo_url: loadedContract.license_back_photo_url || "",
          secondary_driver_first_name: loadedContract.secondary_driver_first_name || "",
          secondary_driver_last_name: loadedContract.secondary_driver_last_name || "",
          secondary_driver_email: loadedContract.secondary_driver_email || "",
          secondary_driver_phone: loadedContract.secondary_driver_phone || "",
          secondary_license_number: loadedContract.secondary_license_number || "",
          secondary_license_issue_date: loadedContract.secondary_license_issue_date || "",
          secondary_license_country: loadedContract.secondary_license_country || "",
          secondary_license_front_photo_url: loadedContract.secondary_license_front_photo_url || "",
          secondary_license_back_photo_url: loadedContract.secondary_license_back_photo_url || "",
          start_date: toLocalDateTime(loadedContract.start_date),
          end_date: toLocalDateTime(loadedContract.end_date),
          deposit_amount: String(loadedContract.deposit_amount ?? ""),
          franchise_amount: String(loadedContract.franchise_amount ?? ""),
          rental_price: String(loadedContract.rental_price ?? ""),
          pickup_location: loadedContract.pickup_location || "",
          return_location: loadedContract.return_location || "",
          delivery_fee: String(loadedContract.delivery_fee ?? ""),
          signature_mode: loadedContract.signature_mode || "onsite",
          terms_and_conditions: loadedContract.terms_and_conditions || "",
        });
      } catch {
        if (active) setError("Impossible de charger le contrat et les véhicules.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [contractId]);

  function set(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  const isExternal = values.source !== "internal";

  function field(name: string, label: string, type = "text", options?: { required?: boolean; step?: string; min?: string }): ReactNode {
    return (
      <label className="contract-edit-page__field" key={name}>
        <span>{label}</span>
        <input
          type={type}
          value={values[name] ?? ""}
          onChange={(event) => set(name, event.target.value)}
          required={options?.required}
          step={options?.step}
          min={options?.min}
        />
      </label>
    );
  }

  function area(name: string, label: string): ReactNode {
    return (
      <label className="contract-edit-page__field contract-edit-page__field--full" key={name}>
        <span>{label}</span>
        <textarea rows={3} value={values[name] ?? ""} onChange={(event) => set(name, event.target.value)} />
      </label>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contract) return;
    if (!values.start_date || !values.end_date) {
      setError("Renseigne les dates et heures de départ et de retour.");
      return;
    }
    if (new Date(values.end_date) <= new Date(values.start_date)) {
      setError("La date de retour doit être postérieure à la date de départ.");
      return;
    }
    if (!values.vehicle_id || !values.contract_number.trim()) {
      setError("Le numéro de contrat et le véhicule sont obligatoires.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const nullable = (value: string | undefined) => value?.trim() ? value.trim() : null;
      const numeric = (value: string | undefined) => value?.trim() ? Number(value) : null;
      const source = values.source || "internal";
      const payload = {
        contract_number: values.contract_number.trim(),
        vehicle_id: Number(values.vehicle_id),
        source,
        is_external: source !== "internal",
        external_platform_reference: nullable(values.external_platform_reference),
        platform_fee: numeric(values.platform_fee),
        net_revenue: numeric(values.net_revenue),
        external_start_mileage: numeric(values.external_start_mileage),
        external_end_mileage: numeric(values.external_end_mileage),
        customer_first_name: values.customer_first_name.trim(),
        customer_last_name: values.customer_last_name.trim(),
        customer_email: nullable(values.customer_email),
        customer_phone: nullable(values.customer_phone),
        customer_address: nullable(values.customer_address),
        license_number: nullable(values.license_number),
        license_issue_date: nullable(values.license_issue_date),
        license_country: nullable(values.license_country),
        license_front_photo_url: nullable(values.license_front_photo_url),
        license_back_photo_url: nullable(values.license_back_photo_url),
        secondary_driver_first_name: nullable(values.secondary_driver_first_name),
        secondary_driver_last_name: nullable(values.secondary_driver_last_name),
        secondary_driver_email: nullable(values.secondary_driver_email),
        secondary_driver_phone: nullable(values.secondary_driver_phone),
        secondary_license_number: nullable(values.secondary_license_number),
        secondary_license_issue_date: nullable(values.secondary_license_issue_date),
        secondary_license_country: nullable(values.secondary_license_country),
        secondary_license_front_photo_url: nullable(values.secondary_license_front_photo_url),
        secondary_license_back_photo_url: nullable(values.secondary_license_back_photo_url),
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        deposit_amount: numeric(values.deposit_amount),
        franchise_amount: numeric(values.franchise_amount),
        rental_price: numeric(values.rental_price),
        pickup_location: nullable(values.pickup_location),
        return_location: nullable(values.return_location),
        delivery_fee: numeric(values.delivery_fee),
        signature_mode: values.signature_mode || contract.signature_mode,
        terms_and_conditions: nullable(values.terms_and_conditions),
      } as unknown as Partial<RentalContractCreatePayload>;

      await updateContract(contract.id, payload);
      navigate(`/contracts/${contract.id}`, { replace: true });
    } catch {
      setError("Impossible d'enregistrer les modifications. Vérifie les informations saisies.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="contract-edit-page__state">Chargement du contrat...</p>;
  if (!contract) {
    return <div className="contract-edit-page__state">
      <p>{error || "Contrat introuvable."}</p>
      <Link to="/contracts">Retour aux contrats</Link>
    </div>;
  }

  return (
    <section className="contract-edit-page">
      <header className="contract-edit-page__header">
        <div>
          <p className="contract-edit-page__eyebrow">Contrat · Modification</p>
          <h2>Modifier {contract.contract_number}</h2>
          <p>Les états des lieux, les photos et le PDF déjà signé sont conservés. Le statut de signature reste inchangé.</p>
        </div>
        <span className="contract-edit-page__signed-note">
          PDF signé conservé
        </span>
      </header>

      <form className="contract-edit-page__form" onSubmit={handleSubmit}>
        <section className="contract-edit-page__section">
          <h3>Contrat et véhicule</h3>
          <div className="contract-edit-page__grid">
            {field("contract_number", "Numéro de contrat", "text", { required: true })}
            <label className="contract-edit-page__field">
              <span>Type de contrat</span>
              <select value={values.source ?? "internal"} onChange={(event) => set("source", event.target.value)}>
                <option value="internal">Interne</option>
                <option value="roadstr">Roadstr</option>
                <option value="turo">Turo</option>
                <option value="other">Autre</option>
                {values.source && !["internal", "roadstr", "turo", "other"].includes(values.source) ? <option value={values.source}>{values.source}</option> : null}
              </select>
            </label>
            <label className="contract-edit-page__field">
              <span>Véhicule</span>
              <select value={values.vehicle_id ?? ""} onChange={(event) => set("vehicle_id", event.target.value)} required>
                <option value="">Choisir un véhicule</option>
                {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.plate_number})</option>)}
              </select>
            </label>
            {!isExternal ? (
              <label className="contract-edit-page__field">
                <span>Mode de signature</span>
                <select value={values.signature_mode ?? "onsite"} onChange={(event) => set("signature_mode", event.target.value)}>
                  <option value="onsite">Sur place</option>
                  <option value="external">Externe</option>
                </select>
              </label>
            ) : null}
          </div>
        </section>

        {isExternal ? (
          <section className="contract-edit-page__section">
            <h3>Informations plateforme</h3>
            <div className="contract-edit-page__grid">
              {field("external_platform_reference", "Référence plateforme")}
              {field("platform_fee", "Commission plateforme (€)", "number", { min: "0", step: "0.01" })}
              {field("net_revenue", "Revenu net (€)", "number", { step: "0.01" })}
              {field("external_start_mileage", "Kilométrage départ", "number", { min: "0", step: "1" })}
              {field("external_end_mileage", "Kilométrage retour", "number", { min: "0", step: "1" })}
            </div>
          </section>
        ) : null}

        <section className="contract-edit-page__section">
          <h3>Client principal</h3>
          <div className="contract-edit-page__grid">
            {field("customer_first_name", "Prénom", "text", { required: !isExternal })}
            {field("customer_last_name", "Nom", "text", { required: !isExternal })}
            {field("customer_email", "Email", "email")}
            {field("customer_phone", "Téléphone", "tel")}
            {area("customer_address", "Adresse")}
          </div>
        </section>

        <section className="contract-edit-page__section">
          <h3>Permis principal</h3>
          <div className="contract-edit-page__grid">
            {field("license_number", "Numéro de permis")}
            {field("license_issue_date", "Date de délivrance", "date")}
            {field("license_country", "Pays du permis")}
            {field("license_front_photo_url", "URL photo recto")}
            {field("license_back_photo_url", "URL photo verso")}
          </div>
        </section>

        <section className="contract-edit-page__section">
          <h3>Conducteur secondaire</h3>
          <div className="contract-edit-page__grid">
            {field("secondary_driver_first_name", "Prénom")}
            {field("secondary_driver_last_name", "Nom")}
            {field("secondary_driver_email", "Email", "email")}
            {field("secondary_driver_phone", "Téléphone", "tel")}
            {field("secondary_license_number", "Numéro de permis")}
            {field("secondary_license_issue_date", "Date de délivrance", "date")}
            {field("secondary_license_country", "Pays du permis")}
            {field("secondary_license_front_photo_url", "URL photo recto")}
            {field("secondary_license_back_photo_url", "URL photo verso")}
          </div>
        </section>

        <section className="contract-edit-page__section">
          <h3>Dates et conditions de location</h3>
          <div className="contract-edit-page__grid">
            {field("start_date", "Départ (date et heure)", "datetime-local", { required: true })}
            {field("end_date", "Retour (date et heure)", "datetime-local", { required: true })}
            {field("rental_price", "Prix de location (€)", "number", { min: "0", step: "0.01" })}
            {field("deposit_amount", "Caution (€)", "number", { min: "0", step: "0.01" })}
            {field("franchise_amount", "Franchise (€)", "number", { min: "0", step: "0.01" })}
            {field("delivery_fee", "Frais de livraison (€)", "number", { min: "0", step: "0.01" })}
            {area("pickup_location", "Lieu de remise")}
            {area("return_location", "Lieu de restitution")}
            {area("terms_and_conditions", "Conditions générales / remarques")}
          </div>
        </section>

        {error ? <p className="contract-edit-page__error">{error}</p> : null}
        <div className="contract-edit-page__actions">
          <Link className="contract-edit-page__cancel" to={`/contracts/${contract.id}`}>Annuler</Link>
          <button type="submit" disabled={isSaving}>{isSaving ? "Enregistrement..." : "Enregistrer les modifications"}</button>
        </div>
      </form>
    </section>
  );
}

export default ContractEditPage;
