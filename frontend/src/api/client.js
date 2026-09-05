const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, params) {
  const url = new URL(
    `${BASE}${path}`,
    BASE ? undefined : window.location.origin,
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${detail}`);
  }
  return res.json();
}

export const api = {
  getIced: () => request("/api/iced"),
  getDimensiones: () => request("/api/dimensiones"),
  getRegistros: (params) => request("/api/registros", params),
  getRegistro: (id) => request(`/api/registros/${id}`),
};
