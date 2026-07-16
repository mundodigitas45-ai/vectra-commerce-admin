import {
  Building2,
  MapPin,
  Save,
  Settings2,
  Store
} from "lucide-react";
import { useState } from "react";

export function Settings() {
  const [companyName, setCompanyName] =
    useState("Miranda Express");

  const [businessName, setBusinessName] =
    useState("Vectra Commerce");

  const [phone, setPhone] =
    useState("+55 91 92007-8425");

  const [neighborhood, setNeighborhood] =
    useState("Mangueirão");

  const [address, setAddress] =
    useState("Travessa 10, Conjunto Catalina, nº 31");

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Sistema</p>
          <h1>Configurações</h1>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={handleSave}
        >
          <Save size={18} />
          Salvar alterações
        </button>
      </header>

      {saved && (
        <div className="settings-success">
          Configurações salvas com sucesso.
        </div>
      )}

      <section className="settings-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Empresa</p>
              <h3>Dados comerciais</h3>
            </div>

            <Building2 size={22} />
          </div>

          <div className="settings-form">
            <label>
              Nome da empresa
              <input
                type="text"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
              />
            </label>

            <label>
              Nome do sistema
              <input
                type="text"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(event.target.value)
                }
              />
            </label>

            <label>
              WhatsApp comercial
              <input
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />
            </label>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Localização</p>
              <h3>Endereço operacional</h3>
            </div>

            <MapPin size={22} />
          </div>

          <div className="settings-form">
            <label>
              Bairro
              <input
                type="text"
                value={neighborhood}
                onChange={(event) =>
                  setNeighborhood(event.target.value)
                }
              />
            </label>

            <label>
              Endereço
              <textarea
                rows={4}
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
              />
            </label>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Operação</p>
              <h3>Status das integrações</h3>
            </div>

            <Settings2 size={22} />
          </div>

          <div className="integration-list">
            <div className="integration-row">
              <div>
                <strong>API Vectra Commerce</strong>
                <span>Backend e Supabase</span>
              </div>

              <span className="integration-status active">
                Conectada
              </span>
            </div>

            <div className="integration-row">
              <div>
                <strong>WhatsApp Cloud API</strong>
                <span>Atendimento automático</span>
              </div>

              <span className="integration-status pending">
                Pendente
              </span>
            </div>

            <div className="integration-row">
              <div>
                <strong>n8n</strong>
                <span>Automação de pedidos</span>
              </div>

              <span className="integration-status pending">
                Pendente
              </span>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Loja</p>
              <h3>Informações do painel</h3>
            </div>

            <Store size={22} />
          </div>

          <div className="settings-info">
            <div>
              <span>Empresa</span>
              <strong>{companyName}</strong>
            </div>

            <div>
              <span>Sistema</span>
              <strong>{businessName}</strong>
            </div>

            <div>
              <span>Local</span>
              <strong>{neighborhood}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}