import { useEffect, useState } from "react";

import { api } from "../api/client.js";

export function useDimensiones() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    api
      .getDimensiones()
      .then((d) => vivo && setData(d))
      .catch((e) => vivo && setError(e))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, []);

  return { data, error, loading };
}
