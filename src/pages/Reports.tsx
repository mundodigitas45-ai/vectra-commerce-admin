import {
  BarChart3,
  LoaderCircle,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Product = {
  product_id: string;
  product_name: string;
  sale_price: number;
  cost_price: number;
  available_quantity: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  net_profit: number;
  gross_profit: number;
  delivery_fee: number;
  customer_name_snapshot: string;
  neighborhood_snapshot: string;
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value ?? 0));
}

function translatePayment(method: string) {
  const methods: Record<string, string> = {
    pix: "Pix",
    cash: "Dinheiro",
    card: "Cartão"
  };

  return methods[method] ?? method;
}

export function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [ordersResponse, productsResponse] =
          await Promise.all([
            api.get("/api/v1/orders"),
            api.get("/api/v1/products")
          ]);

        const orderList = Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data?.data ?? [];

        const productList = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.data ?? [];

        setOrders(orderList);
        setProducts(productList);
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);

        setErrorMessage(
          "Não foi possível carregar os dados dos relatórios."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, []);

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order.total ?? 0),
      0
    );
  }, [orders]);

  const totalNetProfit = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.net_profit ?? 0),
      0
    );
  }, [orders]);

  const totalDeliveryFees = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.delivery_fee ?? 0),
      0
    );
  }, [orders]);

  const totalStockCost = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.cost_price ?? 0) *
          Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  const averageTicket =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  const paymentSummary = useMemo(() => {
    return orders.reduce<Record<string, number>>(
      (summary, order) => {
        const method = order.payment_method ?? "outro";
        summary[method] = (summary[method] ?? 0) + 1;
        return summary;
      },
      {}
    );
  }, [orders]);

  const neighborhoodSummary = useMemo(() => {
    return orders.reduce<Record<string, number>>(
      (summary, order) => {
        const neighborhood =
          order.neighborhood_snapshot ?? "Não informado";

        summary[neighborhood] =
          (summary[neighborhood] ?? 0) + 1;

        return summary;
      },
      {}
    );
  }, [orders]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Análise</p>
          <h1>Relatórios</h1>
        </div>

        <button className="primary-button" type="button">
          Exportar relatório
        </button>
      </header>

      {loading && (
        <section className="panel">
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando relatórios</strong>
            <p>Consultando os dados da API.</p>
          </div>
        </section>
      )}

      {!loading && errorMessage && (
        <section className="panel">
          <div className="empty-state">
            <BarChart3 size={42} />
            <strong>Erro ao carregar relatórios</strong>
            <p>{errorMessage}</p>
          </div>
        </section>
      )}

      {!loading && !errorMessage && (
        <>
          <section className="cards-grid reports-summary">
            <article className="metric-card">
              <span>Receita total</span>
              <strong>{formatCurrency(totalRevenue)}</strong>
              <small>{orders.length} pedidos</small>
            </article>

            <article className="metric-card">
              <span>Lucro líquido</span>
              <strong>{formatCurrency(totalNetProfit)}</strong>
              <small>Resultado dos pedidos</small>
            </article>

            <article className="metric-card">
              <span>Ticket médio</span>
              <strong>{formatCurrency(averageTicket)}</strong>
              <small>Valor médio por pedido</small>
            </article>

            <article className="metric-card">
              <span>Capital em estoque</span>
              <strong>{formatCurrency(totalStockCost)}</strong>
              <small>Calculado pelo custo</small>
            </article>
          </section>

          <section className="reports-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Pagamentos</p>
                  <h3>Formas de pagamento</h3>
                </div>
              </div>

              <div className="report-list">
                {Object.entries(paymentSummary).map(
                  ([method, quantity]) => (
                    <div className="report-row" key={method}>
                      <span>{translatePayment(method)}</span>
                      <strong>{quantity}</strong>
                    </div>
                  )
                )}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Localização</p>
                  <h3>Pedidos por bairro</h3>
                </div>
              </div>

              <div className="report-list">
                {Object.entries(neighborhoodSummary).map(
                  ([neighborhood, quantity]) => (
                    <div
                      className="report-row"
                      key={neighborhood}
                    >
                      <span>{neighborhood}</span>
                      <strong>{quantity}</strong>
                    </div>
                  )
                )}
              </div>
            </article>
          </section>

          <section className="panel reports-financial">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Financeiro</p>
                <h3>Resumo operacional</h3>
              </div>

              <TrendingUp size={24} />
            </div>

            <div className="financial-grid">
              <div>
                <span>Pedidos cadastrados</span>
                <strong>{orders.length}</strong>
              </div>

              <div>
                <span>Produtos cadastrados</span>
                <strong>{products.length}</strong>
              </div>

              <div>
                <span>Taxas de entrega</span>
                <strong>
                  {formatCurrency(totalDeliveryFees)}
                </strong>
              </div>

              <div>
                <span>Margem líquida</span>
                <strong>
                  {totalRevenue > 0
                    ? `${(
                        (totalNetProfit / totalRevenue) *
                        100
                      ).toFixed(1)}%`
                    : "0%"}
                </strong>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}