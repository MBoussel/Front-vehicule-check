import { Link } from "react-router-dom";

import "./HomePage.css";

function HomePage() {
  return (
    <section className="home-page">
      <header className="home-page__header">
        <div>
          <p className="home-page__eyebrow">Tableau de bord</p>
          <h2 className="home-page__title">Bienvenue</h2>
        </div>

        <p className="home-page__description">
          Interface pensée pour tablette et mobile. Tu peux gérer les véhicules,
          créer un contrat, puis enchaîner avec le check guidé, les signatures et le PDF.
        </p>
      </header>

      <div className="home-page__grid">
        <article className="home-page__card">
          <div className="home-page__card-content">
            <h3>Véhicules</h3>
            <p>Créer et réutiliser les véhicules sans les ressaisir.</p>
          </div>

          <div className="home-page__card-actions">
            <Link to="/vehicles" className="home-page__button">
              Voir les véhicules
            </Link>
            <Link to="/vehicles/new" className="home-page__secondary-button">
              Nouveau véhicule
            </Link>
          </div>
        </article>

        <article className="home-page__card">
          <div className="home-page__card-content">
            <h3>Contrats & checks</h3>
            <p>
              Crée un contrat puis lance un check guidé avec photos,
              dégâts, signatures et PDF.
            </p>
          </div>

          <div className="home-page__card-actions">
            <Link to="/contracts" className="home-page__button">
              Voir les contrats
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default HomePage;