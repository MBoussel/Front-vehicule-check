import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getContracts } from "../../api/contractApi";
import type { RentalContract } from "../../types/contract";
import "./ContractListPage.css";

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

  return (
    <section className="contract-list">
      <header className="contract-list__header">
        <h2>Contrats</h2>
        <Link to="/contracts/new" className="contract-list__button">
          Nouveau contrat
        </Link>
      </header>

      {isLoading ? <p>Chargement...</p> : null}

      <div className="contract-list__grid">
        {contracts.map((contract) => (
          <Link
            key={contract.id}
            to={`/contracts/${contract.id}`}
            className="contract-card"
          >
            <strong>{contract.contract_number}</strong>
            <span>
              {contract.customer_first_name} {contract.customer_last_name}
            </span>
            <span>{contract.vehicle?.brand} {contract.vehicle?.model}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ContractListPage;