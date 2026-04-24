import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import "./AppShell.css";

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="app-shell__eyebrow">Location véhicule</p>
          <h1 className="app-shell__title">Gestion agence</h1>
        </div>

        <div className="app-shell__user-block">
          <div className="app-shell__user-info">
            <span className="app-shell__user-name">
              {user ? `${user.first_name} ${user.last_name}` : "Utilisateur"}
            </span>
            <span className="app-shell__user-role">{user?.role ?? ""}</span>
          </div>

          <button className="app-shell__logout-button" onClick={handleLogout} type="button">
            Déconnexion
          </button>
        </div>
      </header>

      <nav className="app-shell__nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "app-shell__nav-link app-shell__nav-link--active" : "app-shell__nav-link"
          }
        >
          Accueil
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) =>
            isActive ? "app-shell__nav-link app-shell__nav-link--active" : "app-shell__nav-link"
          }
        >
          Véhicules
        </NavLink>

        <NavLink
          to="/contracts"
          className={({ isActive }) =>
            isActive ? "app-shell__nav-link app-shell__nav-link--active" : "app-shell__nav-link"
          }
        >
          Contrats
        </NavLink>
      </nav>

      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;