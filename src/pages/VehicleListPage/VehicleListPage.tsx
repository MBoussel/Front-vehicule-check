import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getVehicles } from "../../api/vehicleApi";
import type { Vehicle } from "../../types/vehicle";
import "./VehicleListPage.css";

function formatVehicleStatus(status: Vehicle["status"]): string {
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

function formatFuelType(fuelType: Vehicle["fuel_type"]): string {
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

function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadVehicles() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        setErrorMessage("Impossible de charger les véhicules.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadVehicles();
  }, []);

  return (
    <section className="vehicle-list-page">
      <header className="vehicle-list-page__header">
        <div>
          <p className="vehicle-list-page__eyebrow">Parc véhicule</p>
          <h2 className="vehicle-list-page__title">Véhicules</h2>
        </div>

        <Link to="/vehicles/new" className="vehicle-list-page__add-button">
          Ajouter un véhicule
        </Link>
      </header>

      {isLoading ? <p className="vehicle-list-page__state">Chargement...</p> : null}

      {!isLoading && errorMessage ? (
        <p className="vehicle-list-page__state vehicle-list-page__state--error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && vehicles.length === 0 ? (
        <div className="vehicle-list-page__empty">
          <p className="vehicle-list-page__state">Aucun véhicule enregistré pour le moment.</p>
          <Link to="/vehicles/new" className="vehicle-list-page__empty-button">
            Créer le premier véhicule
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && vehicles.length > 0 ? (
        <div className="vehicle-list-page__grid">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="vehicle-list-page__card">
              <div className="vehicle-list-page__card-top">
                <div>
                  <p className="vehicle-list-page__plate">{vehicle.plate_number}</p>
                  <h3 className="vehicle-list-page__name">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                </div>

                <span
                  className={`vehicle-list-page__status vehicle-list-page__status--${vehicle.status}`}
                >
                  {formatVehicleStatus(vehicle.status)}
                </span>
              </div>

              <div className="vehicle-list-page__meta">
                <div>
                  <span>Carburant</span>
                  <strong>{formatFuelType(vehicle.fuel_type)}</strong>
                </div>

                <div>
                  <span>Kilométrage</span>
                  <strong>{vehicle.current_mileage.toLocaleString("fr-FR")} km</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default VehicleListPage;