import {
  LoaderCircle,
  PackageSearch
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
  }).format(Number(value ?? 0));
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/products");

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setProducts(productList);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);

        setErrorMessage(
          "Não foi possível carregar os produtos."
        );
      } finally {
        setLoading(false);
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

  const stockValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.cost_price ?? 0) *
          Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Produtos</h1>
        </div>

        <button className="primary-button" type="button">
          Novo produto
        </button>
      </header>

      <section className="cards-grid products-summary">
        <article className="metric-card">
          <span>Produtos ativos</span>
          <strong>{loading ? "..." : products.length}</strong>
          <small>Produtos cadastrados</small>
        </article>

        <article className="metric-card">
          <span>Estoque total</span>
          <strong>{loading ? "..." : totalStock}</strong>
          <small>Unidades disponíveis</small>
        </article>

        <article className="metric-card">
          <span>Valor em estoque</span>
          <strong>
            {loading ? "..." : formatCurrency(stockValue)}
          </strong>
          <small>Calculado pelo preço de custo</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inventário</p>
            <h3>Produtos cadastrados</h3>
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando produtos</strong>
            <p>Consultando a API do Vectra Commerce.</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="empty-state">
            <PackageSearch size={42} />
            <strong>Erro ao carregar produtos</strong>
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          products.length === 0 && (
            <div className="empty-state">
              <PackageSearch size={42} />
              <strong>Nenhum produto cadastrado</strong>
              <p>Os produtos aparecerão aqui.</p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          products.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="orders-table products-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço de venda</th>
                    <th>Preço de custo</th>
                    <th>Estoque</th>
                    <th>Estoque mínimo</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td>
                        <strong>{product.product_name}</strong>
                        <small>{product.product_slug}</small>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(product.sale_price)}
                        </strong>
                      </td>

                      <td>
                        <span>
                          {formatCurrency(product.cost_price)}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {product.available_quantity}
                        </strong>
                      </td>

                      <td>
                        <span>
                          {product.minimum_quantity}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            product.is_low_stock
                              ? "stock-status low"
                              : "stock-status normal"
                          }
                        >
                          {product.is_low_stock
                            ? "Estoque baixo"
                            : "Estoque normal"}
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