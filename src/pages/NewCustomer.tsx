import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, UserPlus } from "lucide-react";
import { api } from "../lib/api";

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  neighborhood: string;
  address: string;
  reference: string;
  notes: string;
};

const initialForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  neighborhood: "",
  address: "",
  reference: "",
  notes: ""
};

export function NewCustomer() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<CustomerForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function updateField(
    field: keyof CustomerForm,
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

      await api.post("/api/v1/customers", {
        name: form.name.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        address: form.address.trim() || null,
        reference: form.reference.trim() || null,
        notes: form.notes.trim() || null
      });

      setMessage("Cliente cadastrado com sucesso.");
      setForm(initialForm);

      setTimeout(() => {
        navigate("/clientes");
      }, 900);
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);

      const apiMessage =
        error?.response?.data?.error?.message;

      setIsError(true);
      setMessage(
        apiMessage ?? "Não foi possível cadastrar o cliente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Novo cliente</h1>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/clientes")}
        >
          Voltar
        </button>
      </header>

      <section className="panel">
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Cadastro</p>
                <h3>Dados do cliente</h3>
              </div>

              <UserPlus size={22} />
            </div>

            <div className="form-grid">
              <label>
                Nome
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Nome do cliente"
                />
              </label>

              <label>
                Telefone
                <input
                  required
                  minLength={10}
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="5591999999999"
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="cliente@email.com"
                />
              </label>

              <label>
                Bairro
                <input
                  value={form.neighborhood}
                  onChange={(event) =>
                    updateField(
                      "neighborhood",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Mangueirão"
                />
              </label>

              <label className="form-column-full">
                Endereço
                <input
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="Rua, número e complemento"
                />
              </label>

              <label className="form-column-full">
                Referência
                <input
                  value={form.reference}
                  onChange={(event) =>
                    updateField(
                      "reference",
                      event.target.value
                    )
                  }
                  placeholder="Ponto de referência"
                />
              </label>

              <label className="form-column-full">
                Observações
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
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
              onClick={() => navigate("/clientes")}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="spinner"
                    size={18}
                  />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar cliente"
              )}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}