import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.css";

function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      setErrorMessage("Connexion impossible. Vérifie ton email et ton mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <p className="login-page__eyebrow">Agence de location</p>
        <h1 className="login-page__title">Connexion</h1>
        <p className="login-page__subtitle">
          Connecte-toi pour gérer les véhicules, contrats, checks et signatures.
        </p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <label className="login-page__field">
            <span>Email</span>
            <input
              type="email"
              placeholder="agent@agence.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="login-page__field">
            <span>Mot de passe</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage ? <p className="login-page__error">{errorMessage}</p> : null}

          <button className="login-page__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;