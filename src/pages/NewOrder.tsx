import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, ShoppingCart } from "lucide-react";
import { api } from "../lib/api";

type Product = {
  product_id: string;
  product_name: string;
  sale_price: number;
  available_quantity: number;
};

type OrderItem = {
  product_id: string;
  quantity: number;
};

export function NewOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [preferredDeliveryTime, setPreferredDeliveryTime] =
    useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("/api/v1/products");
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];

        setProducts(list);

        if (list.length > 0) {
          setSelectedProductId(list[0].product_id);
        }
      } catch (error) {
        console.error(error);
        setMessage("Não foi possível carregar os produtos.");
      } finally {
        setLoadingProducts(false);
      }
    }

    void loadProducts();
  }, []);

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => product.product_id === selectedProductId
      ),
    [products, selectedProductId]
  );

  const total = useMemo(() => {
    return Number(selectedProduct?.sale_price ?? 0) * quantity;
  }, [selectedProduct, quantity]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedProductId) {
      setMessage("Selecione um produto.");
      return;
    }

    const items: OrderItem[] = [
      {
        product_id: selectedProductId,
        quantity
      }
    ];

    try {
      setSubmitting(true);
      setMessage("");

      await api.post("/api/v1/orders", {
        customer: {
          name: customerName,
          phone: customerPhone,
          neighborhood,
          address,
          reference
        },
        items,
        payment_method: paymentMethod,
        preferred_delivery_time:
          preferredDeliveryTime || null,
        notes: null
      });

      setMessage("Pedido criado com sucesso.");

      setCustomerName("");
      setCustomerPhone("");
      setNeighborhood("");
      setAddress("");
      setReference("");
      setPreferredDeliveryTime("");
      setQuantity(1);
    } catch (error: any) {
  console.error("Erro ao criar pedido:", error);

  const apiMessage =
    error?.response?.data?.error?.message;

  setMessage(
    apiMessage ?? "Não foi possível criar o pedido."
  );
}
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Operação</p>
          <h1>Novo pedido</h1>
        </div>
      </header>

      <section className="panel">
        {loadingProducts ? (
          <div className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <strong>Carregando produtos</strong>
          </div>
        ) : (
          <form className="order-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Cliente</p>
                  <h3>Dados do cliente</h3>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  Nome
                  <input
                    required
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Telefone
                  <input
                    required
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(event.target.value)
                    }
                  />
                </label>

                <label>
                  Bairro
                  <input
                    required
                    value={neighborhood}
                    onChange={(event) =>
                      setNeighborhood(event.target.value)
                    }
                  />
                </label>

                <label>
                  Endereço
                  <input
                    required
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                  />
                </label>

                <label className="form-column-full">
                  Referência
                  <input
                    value={reference}
                    onChange={(event) =>
                      setReference(event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Produtos</p>
                  <h3>Itens do pedido</h3>
                </div>

                <ShoppingCart size={22} />
              </div>

              <div className="form-grid">
                <label>
                  Produto
                  <select
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(event.target.value)
                    }
                  >
                    {products.map((product) => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {product.product_name} — estoque{" "}
                        {product.available_quantity}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantidade
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct?.available_quantity ?? 1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                  />
                </label>

                <label>
                  Pagamento
                  <select
  value={paymentMethod}
  onChange={(event) =>
    setPaymentMethod(event.target.value)
  }
>
  <option value="pix">Pix</option>
  <option value="cash">Dinheiro</option>
</select>
                </label>

                <label>
                  Horário preferido
                  <input
                    value={preferredDeliveryTime}
                    onChange={(event) =>
                      setPreferredDeliveryTime(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: 18h"
                  />
                </label>
              </div>
            </div>

            <div className="order-total">
              <span>Total do pedido</span>
              <strong>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                }).format(total)}
              </strong>
            </div>

            {message && (
              <div className="form-message">{message}</div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Criando pedido..." : "Criar pedido"}
            </button>
          </form>
        )}
      </section>
    </>
  );
}