import { useEffect, useState } from "react";

import { api } from "../api/client.js";

export function useRegistros(params) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const key = JSON.stringify(params);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    api
      .getRegistros(params)
      .then((d) => vivo && setData(d))
      .catch((e) => vivo && setError(e))
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, error, loading };
}
