import {
  LoaderCircle,
  UserRoundSearch
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  neighborhood: string | null;
  address: string | null;
  reference: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(
      4,
      9
    )}-${digits.slice(9)}`;
  }

  return phone;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/customers");

        const customerList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setCustomers(customerList);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);

        setErrorMessage(
          "Não foi possível carregar os clientes da API."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCustomers();
  }, []);

  const activeCustomers = customers.filter(
    (customer) => customer.is_active
  ).length;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Relacionamento</p>
          <h1>Clientes</h1>
        </div>

        <button
  className="primary-button"
  type="button"
  onClick={() => navigate("/clientes/novo")}
>
  Novo cliente
</button>
      </header>

      <section className="cards-grid customers-summary">
        <article className="metric-card">
          <span>Total de clientes</span>
          <strong>{loading ? "..." : customers.length}</strong>
          <small>Clientes cadastrados</small>
        </article>

        <article className="metric-card">
          <span>Clientes ativos</span>
          <strong>{loading ? "..." : activeCustomers}</strong>
          <small>Disponíveis para atendimento</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Cadastro</p>
            <h3>Clientes cadastrados</h3>
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando clientes</strong>
            <p>Consultando a API do Vectra Commerce.</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="empty-state">
            <UserRoundSearch size={42} />
            <strong>Erro ao carregar clientes</strong>
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          customers.length === 0 && (
            <div className="empty-state">
              <UserRoundSearch size={42} />
              <strong>Nenhum cliente cadastrado</strong>
              <p>Os clientes cadastrados aparecerão aqui.</p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          customers.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="orders-table customers-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Bairro</th>
                    <th>Endereço</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.name}</strong>
                        <small>
                          {customer.email ?? "Sem e-mail"}
                        </small>
                      </td>

                      <td>
                        <span>{formatPhone(customer.phone)}</span>
                      </td>

                      <td>
                        <span>
                          {customer.neighborhood ??
                            "Não informado"}
                        </span>
                      </td>

                      <td>
                        <span>
                          {customer.address ?? "Não informado"}
                        </span>

                        <small>
                          {customer.reference ??
                            "Sem referência"}
                        </small>
                      </td>

                      <td>
                        <span
                          className={
                            customer.is_active
                              ? "customer-status active"
                              : "customer-status inactive"
                          }
                        >
                          {customer.is_active
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </td>

                      <td>
                        <span>
                          {formatDate(customer.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </>
  );
}