import { useRuntimeConfig } from "#app";

export const useApiBaseUrl = (endpoint: string) => {
  const config = useRuntimeConfig();
  return { url: config.public.apiBaseUrl + endpoint };
};
