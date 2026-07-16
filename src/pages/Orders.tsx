import { ClipboardList, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  net_profit: number;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  neighborhood_snapshot: string;
  address_snapshot: string;
  reference_snapshot: string | null;
  preferred_delivery_time: string | null;
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value ?? 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function translateStatus(status: string) {
  const statuses: Record<string, string> = {
    pending_confirmation: "Aguardando confirmação",
    confirmed: "Confirmado",
    preparing: "Em preparação",
    dispatched: "Saiu para entrega",
    delivered: "Entregue",
    cancelled: "Cancelado"
  };

  return statuses[status] ?? status;
}

function translatePayment(method: string) {
  const methods: Record<string, string> = {
    pix: "Pix",
    cash: "Dinheiro",
    card: "Cartão"
  };

  return methods[method] ?? method;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/orders");

        const orderList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setOrders(orderList);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        setErrorMessage(
          "Não foi possível carregar os pedidos da API."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order.total ?? 0),
      0
    );
  }, [orders]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Operação</p>
          <h1>Pedidos</h1>
        </div>

        <button className="primary-button" type="button">
          Novo pedido
        </button>
      </header>

      <section className="cards-grid orders-summary">
        <article className="metric-card">
          <span>Total de pedidos</span>
          <strong>{loading ? "..." : orders.length}</strong>
          <small>Pedidos cadastrados</small>
        </article>

        <article className="metric-card">
          <span>Receita total</span>
          <strong>
            {loading ? "..." : formatCurrency(totalRevenue)}
          </strong>
          <small>Valor dos pedidos</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Histórico</p>
            <h3>Todos os pedidos</h3>
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando pedidos</strong>
            <p>Consultando a API do Vectra Commerce.</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="empty-state">
            <ClipboardList size={42} />
            <strong>Erro ao carregar pedidos</strong>
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          sortedOrders.length === 0 && (
            <div className="empty-state">
              <ClipboardList size={42} />
              <strong>Nenhum pedido cadastrado</strong>
              <p>Os próximos pedidos aparecerão aqui.</p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          sortedOrders.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Local</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>

                      <td>
                        <strong>
                          {order.customer_name_snapshot}
                        </strong>
                        <small>
                          {order.customer_phone_snapshot}
                        </small>
                      </td>

                      <td>
                        <span>
                          {order.neighborhood_snapshot}
                        </span>
                        <small>
                          {order.address_snapshot}
                        </small>
                      </td>

                      <td>
                        <span>
                          {translatePayment(
                            order.payment_method
                          )}
                        </span>
                        <small>{order.payment_status}</small>
                      </td>

                      <td>
                        <span className="order-status">
                          {translateStatus(order.status)}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(order.total)}
                        </strong>
                      </td>

                      <td>
                        <span>
                          {formatDate(order.created_at)}
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