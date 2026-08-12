import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  LoaderCircle,
  PackagePlus
} from "lucide-react";
import { api } from "../lib/api";
import { pickGoogleDriveImage } from "../lib/googleDrivePicker";

type ProductForm = {
  name: string;
  description: string;
  power_watts: string;
  connector_type: string;
  cost_price: string;
  sale_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  warranty_days: string;
  image_url: string;
};

const initialForm: ProductForm = {
  name: "",
  description: "",
  power_watts: "",
  connector_type: "",
  cost_price: "",
  sale_price: "",
  stock_quantity: "0",
  low_stock_threshold: "3",
  warranty_days: "30",
  image_url: ""
};

export function NewProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [importingImage, setImportingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function updateField(
    field: keyof ProductForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleChooseDriveImage() {
    try {
      setImportingImage(true);
      setMessage("");
      setIsError(false);

      const selection = await pickGoogleDriveImage();

      if (!selection) {
        return;
      }

      const response = await api.post(
        "/api/v1/product-media/google-drive/import",
        {
          file_id: selection.fileId,
          access_token: selection.accessToken,
          file_name: selection.fileName,
          mime_type: selection.mimeType
        }
      );

      const publicUrl = response.data?.data?.public_url;

      if (!publicUrl) {
        throw new Error(
          "A API importou o arquivo, mas não retornou a URL da imagem."
        );
      }

      updateField("image_url", publicUrl);
      setMessage("Imagem importada do Google Drive com sucesso.");
    } catch (error: any) {
      console.error("Erro ao importar imagem do Drive:", error);

      const apiMessage =
        error?.response?.data?.error?.message ?? error?.message;

      setIsError(true);
      setMessage(
        apiMessage ?? "Não foi possível importar a imagem do Google Drive."
      );
    } finally {
      setImportingImage(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setIsError(false);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        power_watts: form.power_watts
          ? Number(form.power_watts)
          : null,
        connector_type:
          form.connector_type.trim() || null,
        cost_price: Number(form.cost_price),
        sale_price: Number(form.sale_price),
        stock_quantity: Number(form.stock_quantity),
        low_stock_threshold: Number(
          form.low_stock_threshold
        ),
        warranty_days: Number(form.warranty_days),
        image_url: form.image_url.trim() || null,
        category_id: null
      };

      await api.post("/api/v1/products", payload);

      setMessage("Produto cadastrado com sucesso.");
      setForm(initialForm);

      setTimeout(() => {
        navigate("/produtos");
      }, 900);
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);

      const apiMessage =
        error?.response?.data?.error?.message;

      setIsError(true);
      setMessage(
        apiMessage ?? "Não foi possível cadastrar o produto."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Novo produto</h1>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/produtos")}
        >
          Voltar
        </button>
      </header>

      <section className="panel">
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Informações</p>
                <h3>Dados do produto</h3>
              </div>

              <PackagePlus size={22} />
            </div>

            <div className="form-grid">
              <label>
                Nome do produto
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Ex.: Carregador Turbo 33W"
                />
              </label>

              <label>
                Tipo de conector
                <input
                  value={form.connector_type}
                  onChange={(event) =>
                    updateField(
                      "connector_type",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: USB-C"
                />
              </label>

              <label>
                Potência em watts
                <input
                  type="number"
                  min={1}
                  value={form.power_watts}
                  onChange={(event) =>
                    updateField(
                      "power_watts",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: 33"
                />
              </label>

              <label>
                Garantia em dias
                <input
                  required
                  type="number"
                  min={0}
                  value={form.warranty_days}
                  onChange={(event) =>
                    updateField(
                      "warranty_days",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="form-column-full">
                Descrição
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Descrição do produto"
                  rows={4}
                />
              </label>

              <div className="form-column-full product-media-field">
                <div className="product-media-header">
                  <div>
                    <strong>Imagem principal</strong>
                    <small>
                      Escolha uma imagem da sua biblioteca do Google Drive.
                      Ela será copiada para o armazenamento da loja.
                    </small>
                  </div>

                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void handleChooseDriveImage()}
                    disabled={importingImage || submitting}
                  >
                    {importingImage ? (
                      <>
                        <LoaderCircle className="spinner" size={17} />
                        Importando...
                      </>
                    ) : (
                      <>
                        <ImagePlus size={17} />
                        Escolher do Google Drive
                      </>
                    )}
                  </button>
                </div>

                {form.image_url ? (
                  <div className="product-image-preview">
                    <img
                      src={form.image_url}
                      alt="Prévia da imagem do produto"
                    />

                    <div>
                      <strong>Imagem pronta</strong>
                      <small>
                        Ao cadastrar o produto, esta imagem será usada pelo catálogo.
                      </small>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => updateField("image_url", "")}
                        disabled={submitting}
                      >
                        Remover imagem
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="product-image-placeholder">
                    <ImagePlus size={28} />
                    <span>Nenhuma imagem selecionada</span>
                  </div>
                )}

                <label className="product-media-url-fallback">
                  Ou cole uma URL de imagem
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(event) =>
                      updateField(
                        "image_url",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Financeiro</p>
                <h3>Preço e estoque</h3>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Preço de custo
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.cost_price}
                  onChange={(event) =>
                    updateField(
                      "cost_price",
                      event.target.value
                    )
                  }
                  placeholder="0,00"
                />
              </label>

              <label>
                Preço de venda
                <input
                  required
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={form.sale_price}
                  onChange={(event) =>
                    updateField(
                      "sale_price",
                      event.target.value
                    )
                  }
                  placeholder="0,00"
                />
              </label>

              <label>
                Estoque inicial
                <input
                  required
                  type="number"
                  min={0}
                  value={form.stock_quantity}
                  onChange={(event) =>
                    updateField(
                      "stock_quantity",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Alerta de estoque baixo
                <input
                  required
                  type="number"
                  min={0}
                  value={form.low_stock_threshold}
                  onChange={(event) =>
                    updateField(
                      "low_stock_threshold",
                      event.target.value
                    )
                  }
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
              onClick={() => navigate("/produtos")}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={submitting || importingImage}
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
                "Cadastrar produto"
              )}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
