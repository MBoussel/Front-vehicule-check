import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createVehicle } from "../../api/vehicleApi";
import type { FuelType, VehicleStatus } from "../../types/vehicle";
import "./VehicleCreatePage.css";

function VehicleCreatePage() {
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("essence");
  const [currentMileage, setCurrentMileage] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("available");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const vehicle = await createVehicle({
        brand: brand.trim(),
        model: model.trim(),
        plate_number: plateNumber.trim().toUpperCase(),
        fuel_type: fuelType,
        current_mileage: Number(currentMileage),
        status,
      });

      navigate(`/vehicles/${vehicle.id}`);
    } catch (error) {
      setErrorMessage("Impossible de créer le véhicule.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="vehicle-create-page">
      <header className="vehicle-create-page__header">
        <div>
          <p className="vehicle-create-page__eyebrow">Parc véhicule</p>
          <h2 className="vehicle-create-page__title">Créer un véhicule</h2>
        </div>
        <p className="vehicle-create-page__description">
          Ajoute un véhicule une seule fois pour le réutiliser ensuite dans les contrats.
        </p>
      </header>

      <form className="vehicle-create-page__form" onSubmit={handleSubmit}>
        <div className="vehicle-create-page__grid">
          <label className="vehicle-create-page__field">
            <span>Marque</span>
            <input
              type="text"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Renault"
              required
            />
          </label>

          <label className="vehicle-create-page__field">
            <span>Modèle</span>
            <input
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Clio"
              required
            />
          </label>

          <label className="vehicle-create-page__field">
            <span>Immatriculation</span>
            <input
              type="text"
              value={plateNumber}
              onChange={(event) => setPlateNumber(event.target.value)}
              placeholder="AA-123-BB"
              required
            />
          </label>

          <label className="vehicle-create-page__field">
            <span>Carburant</span>
            <select value={fuelType} onChange={(event) => setFuelType(event.target.value as FuelType)}>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybride</option>
              <option value="electric">Électrique</option>
            </select>
          </label>

          <label className="vehicle-create-page__field">
            <span>Kilométrage actuel</span>
            <input
              type="number"
              min="0"
              value={currentMileage}
              onChange={(event) => setCurrentMileage(event.target.value)}
              placeholder="47000"
              required
            />
          </label>

          <label className="vehicle-create-page__field">
            <span>Statut</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as VehicleStatus)}>
              <option value="available">Disponible</option>
              <option value="rented">Loué</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactif</option>
            </select>
          </label>
        </div>

        {errorMessage ? <p className="vehicle-create-page__error">{errorMessage}</p> : null}

        <div className="vehicle-create-page__actions">
          <button
            type="button"
            className="vehicle-create-page__secondary-button"
            onClick={() => navigate("/vehicles")}
          >
            Annuler
          </button>

          <button type="submit" className="vehicle-create-page__primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le véhicule"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default VehicleCreatePage;