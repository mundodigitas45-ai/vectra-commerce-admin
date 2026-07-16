import {
  LoaderCircle,
  MapPin,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  delivery_fee: number;
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

export function Deliveries() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDeliveries() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/orders");

        const orderList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setOrders(orderList);
      } catch (error) {
        console.error("Erro ao carregar entregas:", error);

        setErrorMessage(
          "Não foi possível carregar as entregas."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDeliveries();
  }, []);

  const deliveryOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== "cancelled" &&
        order.status !== "delivered"
    );
  }, [orders]);

  const dispatchedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "dispatched"
    ).length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "delivered"
    ).length;
  }, [orders]);

  const totalDeliveryFees = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.delivery_fee ?? 0),
      0
    );
  }, [orders]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Logística</p>
          <h1>Entregas</h1>
        </div>

        <button className="primary-button" type="button">
          Nova entrega
        </button>
      </header>

      <section className="cards-grid deliveries-summary">
        <article className="metric-card">
          <span>Entregas pendentes</span>
          <strong>
            {loading ? "..." : deliveryOrders.length}
          </strong>
          <small>Aguardando conclusão</small>
        </article>

        <article className="metric-card">
          <span>Em rota</span>
          <strong>
            {loading ? "..." : dispatchedOrders}
          </strong>
          <small>Saíram para entrega</small>
        </article>

        <article className="metric-card">
          <span>Entregues</span>
          <strong>
            {loading ? "..." : deliveredOrders}
          </strong>
          <small>Pedidos finalizados</small>
        </article>

        <article className="metric-card">
          <span>Taxas de entrega</span>
          <strong>
            {loading
              ? "..."
              : formatCurrency(totalDeliveryFees)}
          </strong>
          <small>Total cobrado</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Roteiro</p>
            <h3>Entregas em andamento</h3>
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando entregas</strong>
            <p>Consultando os pedidos da API.</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="empty-state">
            <Truck size={42} />
            <strong>Erro ao carregar entregas</strong>
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          deliveryOrders.length === 0 && (
            <div className="empty-state">
              <Truck size={42} />
              <strong>Nenhuma entrega pendente</strong>
              <p>As próximas entregas aparecerão aqui.</p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          deliveryOrders.length > 0 && (
            <div className="deliveries-list">
              {deliveryOrders.map((order) => (
                <article
                  className="delivery-card"
                  key={order.id}
                >
                  <div className="delivery-card-header">
                    <div>
                      <strong>{order.order_number}</strong>

                      <span className="order-status">
                        {translateStatus(order.status)}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(order.total)}
                    </strong>
                  </div>

                  <div className="delivery-customer">
                    <strong>
                      {order.customer_name_snapshot}
                    </strong>

                    <span>
                      {order.customer_phone_snapshot}
                    </span>
                  </div>

                  <div className="delivery-address">
                    <MapPin size={18} />

                    <div>
                      <strong>
                        {order.neighborhood_snapshot}
                      </strong>

                      <span>
                        {order.address_snapshot}
                      </span>

                      {order.reference_snapshot && (
                        <small>
                          Referência:{" "}
                          {order.reference_snapshot}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="delivery-meta">
                    <span>
                      Horário:{" "}
                      {order.preferred_delivery_time ??
                        "Não informado"}
                    </span>

                    <span>
                      Taxa:{" "}
                      {formatCurrency(order.delivery_fee)}
                    </span>

                    <span>
                      Criado em:{" "}
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </>
  );
}