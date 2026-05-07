import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getContracts } from "../../api/contractApi";
import type { RentalContract } from "../../types/contract";
import "./ContractListPage.css";

function getContractNumberValue(contractNumber: string): number {
  const lastPart = contractNumber.split("-").at(-1);
  const number = Number(lastPart);

  return Number.isNaN(number) ? 0 : number;
}

function getContractSourceLabel(contract: RentalContract): string {
  if (!contract.is_external) return "Interne";

  const source = String(contract.source || "").trim().toLowerCase();

  if (source === "roadstr") return "Roadstr";
  if (source === "turo") return "Turo";
  if (source === "other") return "Autre";

  return source || "Externe";
}

function getContractSourceClass(contract: RentalContract): string {
  if (!contract.is_external) return "contract-card__source--internal";

  const source = String(contract.source || "").trim().toLowerCase();

  if (source === "roadstr") return "contract-card__source--roadstr";
  if (source === "turo") return "contract-card__source--turo";

  return "contract-card__source--external";
}

function ContractListPage() {
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContracts();
        setContracts(data);
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const sortedContracts = [...contracts].sort((a, b) => {
    return getContractNumberValue(b.contract_number) - getContractNumberValue(a.contract_number);
  });

  return (
    <section className="contract-list">
      <header className="contract-list__header">
        <div>
          <p className="contract-list__eyebrow">Gestion</p>
          <h2>Contrats</h2>
        </div>

        <Link to="/contracts/new" className="contract-list__button">
          Nouveau contrat
        </Link>
      </header>

      {isLoading ? <p className="contract-list__state">Chargement...</p> : null}

      {!isLoading && sortedContracts.length === 0 ? (
        <p className="contract-list__state">Aucun contrat pour le moment.</p>
      ) : null}

      <div className="contract-list__grid">
        {sortedContracts.map((contract) => (
          <Link
            key={contract.id}
            to={`/contracts/${contract.id}`}
            className="contract-card"
          >
            <div className="contract-card__content">
              <strong>{contract.contract_number}</strong>

              <span>
                {contract.customer_first_name} {contract.customer_last_name}
              </span>

              <span>
                {contract.vehicle?.brand} {contract.vehicle?.model}
              </span>
            </div>

            <div className={`contract-card__source ${getContractSourceClass(contract)}`}>
              {getContractSourceLabel(contract)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ContractListPage;
