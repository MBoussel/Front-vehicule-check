import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import { getDashboardStats } from "../../api/dashboardApi";

import type { DashboardStatsResponse } from "../../types/dashboard";

import "./DashboardPage.css";

const COLORS = [
  "#2dd4bf",
  "#facc15",
  "#60a5fa",
  "#fb7185",
  "#a78bfa",
  "#34d399",
];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();

        setStats(data);
      } finally {
        setIsLoading(false);
      }
    }

    void loadStats();
  }, []);

  if (isLoading) {
    return (
      <p className="dashboard-page__state">
        Chargement du dashboard...
      </p>
    );
  }

  if (!stats) {
    return (
      <p className="dashboard-page__state dashboard-page__state--error">
        Impossible de charger les statistiques.
      </p>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">
            Dashboard
          </p>

          <h1 className="dashboard-page__title">
            Statistiques MCR Cars
          </h1>

          <p className="dashboard-page__description">
            Vue globale des performances, revenus et kilomètres.
          </p>
        </div>
      </header>

      <section className="dashboard-page__kpis">
        <article className="dashboard-page__kpi-card">
          <span>💰 Chiffre d'affaires</span>
          <strong>
            {formatMoney(stats.kpis.total_revenue)}
          </strong>
        </article>

        <article className="dashboard-page__kpi-card">
          <span>🟢 Revenu net</span>
          <strong>
            {formatMoney(stats.kpis.total_net_revenue)}
          </strong>
        </article>

        <article className="dashboard-page__kpi-card">
          <span>🚗 Contrats</span>
          <strong>
            {stats.kpis.total_contracts}
          </strong>
        </article>

        <article className="dashboard-page__kpi-card">
          <span>📍 Kilomètres</span>
          <strong>
            {stats.kpis.total_km.toLocaleString("fr-FR")} km
          </strong>
        </article>

        <article className="dashboard-page__kpi-card dashboard-page__kpi-card--damage">
          <span>Frais de dommages récupérés</span>
          <strong>
            {formatMoney(stats.kpis.total_damage_fees)}
          </strong>
          <small>Sur les contrats clôturés</small>
        </article>
      </section>

      <section className="dashboard-page__charts">
        <article className="dashboard-page__chart-card">
          <h3>Répartition revenus</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stats.source_distribution}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
              >
                {stats.source_distribution.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="dashboard-page__chart-card">
          <h3>Revenus par véhicule</h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.revenue_by_vehicle}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {stats.revenue_by_vehicle.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="dashboard-page__charts">
        <article className="dashboard-page__chart-card">
          <h3>Kilomètres par véhicule</h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.km_by_vehicle}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {stats.km_by_vehicle.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="dashboard-page__chart-card">
          <h3>CA par mois</h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={stats.revenue_by_month}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#2dd4bf"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="dashboard-page__table-card">
        <h3>Performance par véhicule</h3>

        <table className="dashboard-page__table">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Contrats</th>
              <th>Kilomètres</th>
              <th>CA</th>
              <th>Net</th>
            </tr>
          </thead>

          <tbody>
            {stats.vehicles.map((vehicle) => (
              <tr key={vehicle.vehicle}>
                <td>{vehicle.vehicle}</td>

                <td>{vehicle.contracts}</td>

                <td>
                  {vehicle.km.toLocaleString("fr-FR")} km
                </td>

                <td>{formatMoney(vehicle.revenue)}</td>

                <td>{formatMoney(vehicle.net_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

export default DashboardPage;