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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError("");

        const response = await api.get("/api/v1/products");

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setProducts(productList);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setProductsError(
          "Não foi possível carregar os produtos da API."
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    void loadProducts();
  }, []);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  const cards = [
    {
      label: "Pedidos hoje",
      value: "0",
      detail: "Nenhum pedido hoje"
    },
    {
      label: "Receita hoje",
      value: "R$ 0,00",
      detail: "Atualizado agora"
    },
    {
      label: "Produtos ativos",
      value: loadingProducts ? "..." : String(products.length),
      detail: productsError ? "Erro na consulta" : "Dados da API"
    },
    {
      label: "Estoque total",
      value: loadingProducts ? "..." : String(totalStock),
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

        <button className="primary-button" type="button">
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
          <article className="metric-card" key={card.label}>
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
              <p className="eyebrow">Catálogo</p>
              <h3>Produtos cadastrados</h3>
            </div>
          </div>

          {loadingProducts && (
            <div className="empty-state">
              <LoaderCircle className="spinner" size={42} />
              <strong>Carregando produtos</strong>
              <p>Consultando a API do Vectra Commerce.</p>
            </div>
          )}

          {!loadingProducts && productsError && (
            <div className="empty-state">
              <ClipboardList size={42} />
              <strong>Erro ao carregar produtos</strong>
              <p>{productsError}</p>
            </div>
          )}

          {!loadingProducts &&
            !productsError &&
            products.length === 0 && (
              <div className="empty-state">
                <PackageCheck size={42} />
                <strong>Nenhum produto cadastrado</strong>
                <p>Os produtos cadastrados aparecerão aqui.</p>
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
                      <strong>{product.product_name}</strong>

                      <p>
                        Preço:{" "}
                        {formatCurrency(product.sale_price)}
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
                <strong>API conectada</strong>
                <p>
                  Os produtos e o estoque já estão vindo do backend.
                </p>
              </div>
            </div>

            <div className="priority-item">
              <span className="priority-dot warning" />

              <div>
                <strong>Pedidos ainda não conectados</strong>
                <p>
                  A consulta de pedidos será adicionada na próxima
                  etapa.
                </p>
              </div>
            </div>

            <div className="priority-item">
              <span className="priority-dot info" />

              <div>
                <strong>WhatsApp ainda não conectado</strong>
                <p>
                  A integração será configurada posteriormente.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}