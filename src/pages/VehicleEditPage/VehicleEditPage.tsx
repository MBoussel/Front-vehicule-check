import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getVehicleById, updateVehicle } from "../../api/vehicleApi";
import type { FuelType, VehicleStatus } from "../../types/vehicle";
import "./VehicleEditPage.css";

function toInputValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumberOrZero(value: string): number {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function VehicleEditPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("essence");
  const [initialMileage, setInitialMileage] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("available");

  const [depositAmount, setDepositAmount] = useState("");
  const [franchiseAmount, setFranchiseAmount] = useState("");
  const [includedKm, setIncludedKm] = useState("");
  const [extraKmPrice, setExtraKmPrice] = useState("");
  const [immobilizationFeePerDay, setImmobilizationFeePerDay] = useState("");
  const [keyLossFee, setKeyLossFee] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) {
        setErrorMessage("Véhicule introuvable.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const vehicle = await getVehicleById(Number(vehicleId));

        setBrand(vehicle.brand);
        setModel(vehicle.model);
        setPlateNumber(vehicle.plate_number);
        setFuelType(vehicle.fuel_type as FuelType);
        setInitialMileage(toInputValue(vehicle.initial_mileage));
        setCurrentMileage(toInputValue(vehicle.current_mileage));
        setStatus(vehicle.status as VehicleStatus);

        setDepositAmount(toInputValue(vehicle.deposit_amount));
        setFranchiseAmount(toInputValue(vehicle.franchise_amount));
        setIncludedKm(toInputValue(vehicle.included_km));
        setExtraKmPrice(toInputValue(vehicle.extra_km_price));
        setImmobilizationFeePerDay(toInputValue(vehicle.immobilization_fee_per_day));
        setKeyLossFee(toInputValue(vehicle.key_loss_fee));
      } catch {
        setErrorMessage("Impossible de charger le véhicule.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadVehicle();
  }, [vehicleId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicleId) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await updateVehicle(Number(vehicleId), {
        brand: brand.trim(),
        model: model.trim(),
        plate_number: plateNumber.trim().toUpperCase(),
        fuel_type: fuelType,
        current_mileage: toNumberOrZero(currentMileage),
        status,

        deposit_amount: toNumberOrZero(depositAmount),
        franchise_amount: toNumberOrZero(franchiseAmount),
        included_km: toNumberOrZero(includedKm),
        extra_km_price: toNumberOrZero(extraKmPrice),
        immobilization_fee_per_day: toNumberOrZero(immobilizationFeePerDay),
        key_loss_fee: toNumberOrZero(keyLossFee),
      });

      navigate(`/vehicles/${vehicleId}`);
    } catch {
      setErrorMessage("Impossible de mettre à jour le véhicule.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="vehicle-edit-page__state">Chargement...</p>;
  }

  return (
    <section className="vehicle-edit-page">
      <header className="vehicle-edit-page__header">
        <div>
          <p className="vehicle-edit-page__eyebrow">Parc véhicule</p>
          <h2 className="vehicle-edit-page__title">Modifier le véhicule</h2>
        </div>
      </header>

      <form className="vehicle-edit-page__form" onSubmit={handleSubmit}>
        <section className="vehicle-edit-page__section">
          <div className="vehicle-edit-page__section-header">
            <h3>Informations véhicule</h3>
            <p>Identité, carburant, statut et kilométrages du véhicule.</p>
          </div>

          <div className="vehicle-edit-page__grid">
            <label className="vehicle-edit-page__field">
              <span>Marque</span>
              <input
                type="text"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                required
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Modèle</span>
              <input
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                required
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Immatriculation</span>
              <input
                type="text"
                value={plateNumber}
                onChange={(event) => setPlateNumber(event.target.value)}
                required
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Carburant</span>
              <select
                value={fuelType}
                onChange={(event) => setFuelType(event.target.value as FuelType)}
              >
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybride</option>
                <option value="electric">Électrique</option>
              </select>
            </label>

            <label className="vehicle-edit-page__field">
              <span>Kilométrage de départ</span>
              <input type="number" value={initialMileage} readOnly />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Kilométrage actuel</span>
              <input
                type="number"
                min="0"
                value={currentMileage}
                onChange={(event) => setCurrentMileage(event.target.value)}
                required
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Statut</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as VehicleStatus)}
              >
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactif</option>
              </select>
            </label>
          </div>
        </section>

        <section className="vehicle-edit-page__section">
          <div className="vehicle-edit-page__section-header">
            <h3>Conditions financières</h3>
            <p>Caution, franchise, kilomètres inclus et frais applicables au contrat.</p>
          </div>

          <div className="vehicle-edit-page__grid">
            <label className="vehicle-edit-page__field">
              <span>Caution (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                placeholder="2000"
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Franchise (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={franchiseAmount}
                onChange={(event) => setFranchiseAmount(event.target.value)}
                placeholder="1500"
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Kilomètres inclus / jour</span>
              <input
                type="number"
                min="0"
                value={includedKm}
                onChange={(event) => setIncludedKm(event.target.value)}
                placeholder="200"
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Prix km supplémentaire (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={extraKmPrice}
                onChange={(event) => setExtraKmPrice(event.target.value)}
                placeholder="1"
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Frais immobilisation / jour (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={immobilizationFeePerDay}
                onChange={(event) => setImmobilizationFeePerDay(event.target.value)}
                placeholder="80"
              />
            </label>

            <label className="vehicle-edit-page__field">
              <span>Perte clé / carte (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={keyLossFee}
                onChange={(event) => setKeyLossFee(event.target.value)}
                placeholder="250"
              />
            </label>
          </div>
        </section>

        {errorMessage ? (
          <p className="vehicle-edit-page__error">{errorMessage}</p>
        ) : null}

        <div className="vehicle-edit-page__actions">
          <button
            type="button"
            className="vehicle-edit-page__secondary-button"
            onClick={() => navigate(`/vehicles/${vehicleId}`)}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="vehicle-edit-page__primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default VehicleEditPage;
