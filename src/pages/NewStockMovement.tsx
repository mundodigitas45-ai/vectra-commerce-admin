import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  LoaderCircle
} from "lucide-react";
import { api } from "../lib/api";

type Product = {
  product_id: string;
  product_name: string;
  available_quantity: number;
};

type MovementForm = {
  product_id: string;
  movement_type: "entry" | "exit" | "adjustment";
  adjustment_direction: "increase" | "decrease";
  quantity: string;
  reason: string;
  notes: string;
};

const initialForm: MovementForm = {
  product_id: "",
  movement_type: "entry",
  adjustment_direction: "increase",
  quantity: "1",
  reason: "",
  notes: ""
};

export function NewStockMovement() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] =
    useState<MovementForm>(initialForm);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get(
          "/api/v1/products"
        );

        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setProducts(list);

        if (list.length > 0) {
          setForm((current) => ({
            ...current,
            product_id: list[0].product_id
          }));
        }
      } catch (error) {
        console.error(
          "Erro ao carregar produtos:",
          error
        );

        setIsError(true);
        setMessage(
          "Não foi possível carregar os produtos."
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    void loadProducts();
  }, []);

  function updateField(
    field: keyof MovementForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setIsError(false);

      await api.post(
        "/api/v1/inventory/movements",
        {
          product_id: form.product_id,
          movement_type: form.movement_type,
          quantity: Number(form.quantity),
          adjustment_direction:
            form.movement_type === "adjustment"
              ? form.adjustment_direction
              : null,
          reason: form.reason.trim(),
          notes: form.notes.trim() || null
        }
      );

      setMessage(
        "Movimentação registrada com sucesso."
      );

      setTimeout(() => {
        navigate("/estoque");
      }, 900);
    } catch (error: any) {
      console.error(
        "Erro ao registrar movimentação:",
        error
      );

      const apiMessage =
        error?.response?.data?.error?.message;

      setIsError(true);
      setMessage(
        apiMessage ??
          "Não foi possível registrar a movimentação."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProduct = products.find(
    (product) =>
      product.product_id === form.product_id
  );

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Estoque</p>
          <h1>Registrar movimentação</h1>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/estoque")}
        >
          Voltar
        </button>
      </header>

      <section className="panel">
        {loadingProducts ? (
          <div className="empty-state">
            <LoaderCircle
              className="spinner"
              size={42}
            />

            <strong>Carregando produtos</strong>
          </div>
        ) : (
          <form
            className="order-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Operação</p>
                  <h3>Dados da movimentação</h3>
                </div>

                {form.movement_type === "entry" ? (
                  <ArrowUpCircle size={24} />
                ) : (
                  <ArrowDownCircle size={24} />
                )}
              </div>

              <div className="form-grid">
                <label>
                  Produto
                  <select
                    required
                    value={form.product_id}
                    onChange={(event) =>
                      updateField(
                        "product_id",
                        event.target.value
                      )
                    }
                  >
                    {products.map((product) => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {product.product_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Estoque disponível
                  <input
                    value={
                      selectedProduct?.available_quantity ??
                      0
                    }
                    disabled
                  />
                </label>

                <label>
                  Tipo da movimentação
                  <select
                    value={form.movement_type}
                    onChange={(event) =>
                      updateField(
                        "movement_type",
                        event.target.value
                      )
                    }
                  >
                    <option value="entry">
                      Entrada de estoque
                    </option>

                    <option value="exit">
                      Saída de estoque
                    </option>

                    <option value="adjustment">
                      Ajuste manual
                    </option>
                  </select>
                </label>

                {form.movement_type ===
                  "adjustment" && (
                  <label>
                    Direção do ajuste
                    <select
                      value={
                        form.adjustment_direction
                      }
                      onChange={(event) =>
                        updateField(
                          "adjustment_direction",
                          event.target.value
                        )
                      }
                    >
                      <option value="increase">
                        Aumentar estoque
                      </option>

                      <option value="decrease">
                        Diminuir estoque
                      </option>
                    </select>
                  </label>
                )}

                <label>
                  Quantidade
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(event) =>
                      updateField(
                        "quantity",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="form-column-full">
                  Motivo
                  <input
                    required
                    minLength={2}
                    value={form.reason}
                    onChange={(event) =>
                      updateField(
                        "reason",
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Compra de novo estoque"
                  />
                </label>

                <label className="form-column-full">
                  Observações
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Informações adicionais"
                  />
                </label>
              </div>
            </div>

            {message && (
              <div
                className={
                  isError
                    ? "form-message form-message-error"
                    : "form-message"
                }
              >
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  navigate("/estoque")
                }
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                className="primary-button"
                type="submit"
                disabled={
                  submitting ||
                  products.length === 0
                }
              >
                {submitting
                  ? "Registrando..."
                  : "Registrar movimentação"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}