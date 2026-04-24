import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deleteVehicle, getVehicleById } from "../../api/vehicleApi";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleDetailPage.css";

function formatStatus(status: Vehicle["status"]) {
  switch (status) {
    case "available":
      return "Disponible";
    case "rented":
      return "Loué";
    case "maintenance":
      return "Maintenance";
    case "inactive":
      return "Inactif";
    default:
      return status;
  }
}

function formatFuel(fuelType: Vehicle["fuel_type"]) {
  switch (fuelType) {
    case "essence":
      return "Essence";
    case "diesel":
      return "Diesel";
    case "hybrid":
      return "Hybride";
    case "electric":
      return "Électrique";
    default:
      return fuelType;
  }
}

function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
        const data = await getVehicleById(Number(vehicleId));
        setVehicle(data);
      } catch (error) {
        setErrorMessage("Impossible de charger le véhicule.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadVehicle();
  }, [vehicleId]);

  async function handleDelete() {
    if (!vehicle) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le véhicule ${vehicle.brand} ${vehicle.model} (${vehicle.plate_number}) ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVehicle(vehicle.id);
      navigate("/vehicles");
    } catch (error) {
      setErrorMessage("Impossible de supprimer le véhicule.");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <p className="vehicle-detail-page__state">Chargement...</p>;
  }

  if (errorMessage && !vehicle) {
    return <p className="vehicle-detail-page__state vehicle-detail-page__state--error">{errorMessage}</p>;
  }

  if (!vehicle) {
    return <p className="vehicle-detail-page__state">Véhicule introuvable.</p>;
  }

  return (
    <section className="vehicle-detail-page">
      <header className="vehicle-detail-page__header">
        <div>
          <p className="vehicle-detail-page__eyebrow">Détail véhicule</p>
          <h2 className="vehicle-detail-page__title">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="vehicle-detail-page__plate">{vehicle.plate_number}</p>
        </div>

        <span className={`vehicle-detail-page__status vehicle-detail-page__status--${vehicle.status}`}>
          {formatStatus(vehicle.status)}
        </span>
      </header>

      {errorMessage ? (
        <p className="vehicle-detail-page__state vehicle-detail-page__state--error">{errorMessage}</p>
      ) : null}

      <div className="vehicle-detail-page__content">
        <article className="vehicle-detail-page__card">
          <h3>Informations</h3>

          <div className="vehicle-detail-page__grid">
            <div className="vehicle-detail-page__item">
              <span>Marque</span>
              <strong>{vehicle.brand}</strong>
            </div>

            <div className="vehicle-detail-page__item">
              <span>Modèle</span>
              <strong>{vehicle.model}</strong>
            </div>

            <div className="vehicle-detail-page__item">
              <span>Immatriculation</span>
              <strong>{vehicle.plate_number}</strong>
            </div>

            <div className="vehicle-detail-page__item">
              <span>Carburant</span>
              <strong>{formatFuel(vehicle.fuel_type)}</strong>
            </div>

            <div className="vehicle-detail-page__item">
              <span>Kilométrage</span>
              <strong>{vehicle.current_mileage.toLocaleString("fr-FR")} km</strong>
            </div>

            <div className="vehicle-detail-page__item">
              <span>Statut</span>
              <strong>{formatStatus(vehicle.status)}</strong>
            </div>
          </div>
        </article>

        <article className="vehicle-detail-page__card">
          <h3>Actions</h3>

          <div className="vehicle-detail-page__actions">
            <Link to={`/vehicles/${vehicle.id}/edit`} className="vehicle-detail-page__primary-button">
              Modifier
            </Link>

            <button
              type="button"
              className="vehicle-detail-page__danger-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>

            <Link to="/vehicles" className="vehicle-detail-page__secondary-button">
              Retour liste
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default VehicleDetailPage;