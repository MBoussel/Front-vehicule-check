import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getVehicleById, updateVehicle } from "../../api/vehicleApi";
import type { FuelType, VehicleStatus } from "../../types/vehicle";
import "./VehicleEditPage.css";

function VehicleEditPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("essence");
  const [currentMileage, setCurrentMileage] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("available");

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
        setFuelType(vehicle.fuel_type);
        setCurrentMileage(String(vehicle.current_mileage));
        setStatus(vehicle.status);
      } catch (error) {
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
        current_mileage: Number(currentMileage),
        status,
      });

      navigate(`/vehicles/${vehicleId}`);
    } catch (error) {
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
        <div className="vehicle-edit-page__grid">
          <label className="vehicle-edit-page__field">
            <span>Marque</span>
            <input type="text" value={brand} onChange={(event) => setBrand(event.target.value)} required />
          </label>

          <label className="vehicle-edit-page__field">
            <span>Modèle</span>
            <input type="text" value={model} onChange={(event) => setModel(event.target.value)} required />
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
            <select value={fuelType} onChange={(event) => setFuelType(event.target.value as FuelType)}>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybride</option>
              <option value="electric">Électrique</option>
            </select>
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
            <select value={status} onChange={(event) => setStatus(event.target.value as VehicleStatus)}>
              <option value="available">Disponible</option>
              <option value="rented">Loué</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactif</option>
            </select>
          </label>
        </div>

        {errorMessage ? <p className="vehicle-edit-page__error">{errorMessage}</p> : null}

        <div className="vehicle-edit-page__actions">
          <button
            type="button"
            className="vehicle-edit-page__secondary-button"
            onClick={() => navigate(`/vehicles/${vehicleId}`)}
          >
            Annuler
          </button>

          <button type="submit" className="vehicle-edit-page__primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default VehicleEditPage;