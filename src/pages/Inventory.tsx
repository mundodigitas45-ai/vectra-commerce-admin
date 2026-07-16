import {
  AlertTriangle,
  Boxes,
  LoaderCircle
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

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/api/v1/products");

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setProducts(productList);
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);

        setErrorMessage(
          "Não foi possível carregar o estoque da API."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInventory();
  }, []);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) => product.is_low_stock
    );
  }, [products]);

  const totalCostValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.cost_price ?? 0) *
          Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  const totalSaleValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.sale_price ?? 0) *
          Number(product.available_quantity ?? 0),
      0
    );
  }, [products]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventário</p>
          <h1>Estoque</h1>
        </div>

        <button className="primary-button" type="button">
          Registrar movimentação
        </button>
      </header>

      <section className="cards-grid inventory-summary">
        <article className="metric-card">
          <span>Estoque total</span>
          <strong>{loading ? "..." : totalStock}</strong>
          <small>Unidades disponíveis</small>
        </article>

        <article className="metric-card">
          <span>Produtos com estoque baixo</span>
          <strong>
            {loading ? "..." : lowStockProducts.length}
          </strong>
          <small>Precisam de reposição</small>
        </article>

        <article className="metric-card">
          <span>Valor pelo custo</span>
          <strong>
            {loading
              ? "..."
              : formatCurrency(totalCostValue)}
          </strong>
          <small>Capital investido</small>
        </article>

        <article className="metric-card">
          <span>Valor potencial de venda</span>
          <strong>
            {loading
              ? "..."
              : formatCurrency(totalSaleValue)}
          </strong>
          <small>Receita bruta possível</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Controle</p>
            <h3>Posição atual do estoque</h3>
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando estoque</strong>
            <p>Consultando a API do Vectra Commerce.</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="empty-state">
            <Boxes size={42} />
            <strong>Erro ao carregar estoque</strong>
            <p>{errorMessage}</p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          products.length === 0 && (
            <div className="empty-state">
              <Boxes size={42} />
              <strong>Nenhum produto em estoque</strong>
              <p>Os produtos cadastrados aparecerão aqui.</p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          products.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="orders-table inventory-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Disponível</th>
                    <th>Mínimo</th>
                    <th>Custo unitário</th>
                    <th>Valor em estoque</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stockValue =
                      Number(product.cost_price ?? 0) *
                      Number(
                        product.available_quantity ?? 0
                      );

                    return (
                      <tr key={product.product_id}>
                        <td>
                          <strong>
                            {product.product_name}
                          </strong>
                          <small>
                            {product.product_slug}
                          </small>
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
                          <span>
                            {formatCurrency(
                              product.cost_price
                            )}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(stockValue)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              product.is_low_stock
                                ? "inventory-status low"
                                : "inventory-status normal"
                            }
                          >
                            {product.is_low_stock && (
                              <AlertTriangle size={14} />
                            )}

                            {product.is_low_stock
                              ? "Estoque baixo"
                              : "Estoque normal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </>
  );
}