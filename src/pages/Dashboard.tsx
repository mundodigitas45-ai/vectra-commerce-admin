import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LoaderCircle,
  PackageCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Product = {
  product_id: string;
  product_name: string;
  product_slug: string;
  sale_price: number;
  cost_price: number;
  available_quantity: number;
  minimum_quantity: number;
  is_low_stock: boolean;
};

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

function translateOrderStatus(status: string) {
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

function translatePaymentMethod(method: string) {
  const methods: Record<string, string> = {
    pix: "Pix",
    cash: "Dinheiro",
    card: "Cartão"
  };

  return methods[method] ?? method;
}

export function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [productsError, setProductsError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      const productsRequest = api.get("/api/v1/products");
      const ordersRequest = api.get("/api/v1/orders");

      const [productsResult, ordersResult] =
        await Promise.allSettled([
          productsRequest,
          ordersRequest
        ]);

      if (productsResult.status === "fulfilled") {
        const productList = Array.isArray(
          productsResult.value.data
        )
          ? productsResult.value.data
          : productsResult.value.data?.data ?? [];

        setProducts(productList);
      } else {
        console.error(
          "Erro ao carregar produtos:",
          productsResult.reason
        );

        setProductsError(
          "Não foi possível carregar os produtos."
        );
      }

      if (ordersResult.status === "fulfilled") {
        const orderList = Array.isArray(
          ordersResult.value.data
        )
          ? ordersResult.value.data
          : ordersResult.value.data?.data ?? [];

        setOrders(orderList);
      } else {
        console.error(
          "Erro ao carregar pedidos:",
          ordersResult.reason
        );

        setOrdersError(
          "Não foi possível carregar os pedidos."
        );
      }

      setLoadingProducts(false);
      setLoadingOrders(false);
    }

    void loadDashboardData();
  }, []);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.total ?? 0),
      0
    );
  }, [orders]);

  const totalProfit = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.net_profit ?? 0),
      0
    );
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  const cards = [
    {
      label: "Pedidos",
      value: loadingOrders ? "..." : String(orders.length),
      detail: ordersError
        ? "Erro na consulta"
        : "Pedidos cadastrados"
    },
    {
      label: "Receita total",
      value: loadingOrders
        ? "..."
        : formatCurrency(totalRevenue),
      detail: `Lucro líquido: ${formatCurrency(totalProfit)}`
    },
    {
      label: "Produtos ativos",
      value: loadingProducts
        ? "..."
        : String(products.length),
      detail: productsError
        ? "Erro na consulta"
        : "Dados da API"
    },
    {
      label: "Estoque total",
      value: loadingProducts
        ? "..."
        : String(totalStock),
      detail: "Unidades disponíveis"
    }
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Dashboard</h1>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => navigate("/pedidos/novo")}
        >
          Novo pedido
        </button>
      </header>

      <section className="welcome-card">
        <div>
          <p className="eyebrow">Bom dia</p>

          <h2>Bem-vindo ao Vectra Commerce</h2>

          <p>
            Acompanhe pedidos, produtos, clientes e estoque da
            Miranda Express em um só lugar.
          </p>
        </div>

        <div className="status-badge">
          <span />
          Sistema online
        </div>
      </section>

      <section className="cards-grid">
        {cards.map((card) => (
          <article
            className="metric-card"
            key={card.label}
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Operação</p>
              <h3>Pedidos recentes</h3>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => navigate("/pedidos")}
            >
              Ver todos
            </button>
          </div>

          {loadingOrders && (
            <div className="empty-state">
              <LoaderCircle
                className="spinner"
                size={42}
              />

              <strong>Carregando pedidos</strong>

              <p>Consultando a API do Vectra Commerce.</p>
            </div>
          )}

          {!loadingOrders && ordersError && (
            <div className="empty-state">
              <ClipboardList size={42} />

              <strong>Erro ao carregar pedidos</strong>

              <p>{ordersError}</p>
            </div>
          )}

          {!loadingOrders &&
            !ordersError &&
            recentOrders.length === 0 && (
              <div className="empty-state">
                <ClipboardList size={42} />

                <strong>Nenhum pedido cadastrado</strong>

                <p>
                  Os próximos pedidos aparecerão aqui.
                </p>
              </div>
            )}

          {!loadingOrders &&
            !ordersError &&
            recentOrders.length > 0 && (
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div
                    className="order-row"
                    key={order.id}
                  >
                    <div className="order-main">
                      <div className="order-title">
                        <strong>
                          {order.order_number}
                        </strong>

                        <span className="order-status">
                          {translateOrderStatus(
                            order.status
                          )}
                        </span>
                      </div>

                      <p>
                        {order.customer_name_snapshot}
                        {" • "}
                        {order.neighborhood_snapshot}
                      </p>

                      <small>
                        {translatePaymentMethod(
                          order.payment_method
                        )}
                        {" • "}
                        {formatDate(order.created_at)}
                      </small>
                    </div>

                    <div className="order-value">
                      <strong>
                        {formatCurrency(order.total)}
                      </strong>

                      <small>
                        Lucro:{" "}
                        {formatCurrency(order.net_profit)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inteligência</p>
              <h3>Central de prioridades</h3>
            </div>
          </div>

          <div className="priority-list">
            <div className="priority-item">
              <span className="priority-dot success" />

              <div>
                <strong>
                  Produtos e pedidos conectados
                </strong>

                <p>
                  O painel já consulta os dados reais do backend.
                </p>
              </div>
            </div>

            <div className="priority-item">
              <span className="priority-dot warning" />

              <div>
                <strong>
                  {orders.length} pedidos aguardando análise
                </strong>

                <p>
                  Confira os pedidos pendentes antes de preparar
                  a entrega.
                </p>
              </div>
            </div>

            <div className="priority-item">
              <span className="priority-dot info" />

              <div>
                <strong>
                  WhatsApp ainda não conectado
                </strong>

                <p>
                  A integração será configurada posteriormente.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel products-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h3>Produtos cadastrados</h3>
          </div>
        </div>

        {loadingProducts && (
          <div className="empty-state">
            <LoaderCircle
              className="spinner"
              size={42}
            />

            <strong>Carregando produtos</strong>

            <p>Consultando os produtos da API.</p>
          </div>
        )}

        {!loadingProducts && productsError && (
          <div className="empty-state">
            <PackageCheck size={42} />

            <strong>Erro ao carregar produtos</strong>

            <p>{productsError}</p>
          </div>
        )}

        {!loadingProducts &&
          !productsError &&
          products.length > 0 && (
            <div className="product-list">
              {products.map((product) => (
                <div
                  className="product-row"
                  key={product.product_id}
                >
                  <div>
                    <strong>
                      {product.product_name}
                    </strong>

                    <p>
                      Preço:{" "}
                      {formatCurrency(
                        product.sale_price
                      )}
                    </p>

                    <p>ID: {product.product_id}</p>
                  </div>

                  <div className="product-stock">
                    <span>Estoque</span>

                    <strong>
                      {product.available_quantity}
                    </strong>

                    <small
                      className={
                        product.is_low_stock
                          ? "stock-low"
                          : "stock-ok"
                      }
                    >
                      {product.is_low_stock
                        ? "Estoque baixo"
                        : "Estoque normal"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </>
  );
}