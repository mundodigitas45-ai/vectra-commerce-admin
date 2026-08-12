type GoogleDriveSelection = {
  fileId: string;
  fileName: string;
  mimeType: string;
  accessToken: string;
};

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensureGoogleLibraries() {
  await Promise.all([
    loadScript(
      "google-identity-services",
      "https://accounts.google.com/gsi/client"
    ),
    loadScript(
      "google-api-picker",
      "https://apis.google.com/js/api.js"
    )
  ]);

  await new Promise<void>((resolve, reject) => {
    const gapi = window.gapi;

    if (!gapi) {
      reject(new Error("Google API não carregou corretamente."));
      return;
    }

    gapi.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Não foi possível carregar o Google Picker."))
    });
  });
}

export async function pickGoogleDriveImage(): Promise<GoogleDriveSelection | null> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error(
      "Configure VITE_GOOGLE_CLIENT_ID e VITE_GOOGLE_API_KEY no painel."
    );
  }

  await ensureGoogleLibraries();

  const google = window.google;

  if (!google?.accounts?.oauth2 || !google?.picker) {
    throw new Error("Serviços do Google Drive indisponíveis no navegador.");
  }

  const accessToken = await new Promise<string>((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (response: any) => {
        if (response?.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }

        if (!response?.access_token) {
          reject(new Error("O Google não retornou autorização para o Drive."));
          return;
        }

        resolve(response.access_token);
      },
      error_callback: (error: any) => {
        reject(new Error(error?.message ?? "Autorização do Google cancelada."));
      }
    });

    tokenClient.requestAccessToken({ prompt: "" });
  });

  return new Promise<GoogleDriveSelection | null>((resolve, reject) => {
    const imageView = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMimeTypes("image/jpeg,image/png,image/webp,image/gif");

    const picker = new google.picker.PickerBuilder()
      .addView(imageView)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setTitle("Escolha uma imagem do produto")
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.CANCEL) {
          resolve(null);
          return;
        }

        if (data.action !== google.picker.Action.PICKED) {
          return;
        }

        const doc = data.docs?.[0];

        if (!doc?.id) {
          reject(new Error("O Google Drive não retornou o arquivo selecionado."));
          return;
        }

        resolve({
          fileId: doc.id,
          fileName: doc.name ?? "produto.jpg",
          mimeType: doc.mimeType ?? "image/jpeg",
          accessToken
        });
      })
      .build();

    picker.setVisible(true);
  });
}

export {};
