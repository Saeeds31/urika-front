import type { UseFetchOptions } from "nuxt/app";
import { useRuntimeConfig } from "#app";
import type { ApiResponse } from "~/types/apiResponseModel";

export function useCustomFetch() {
  const authToken = useCookie("authToken").value;
  async function get<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<ApiResponse<T>>(endpoint, {
        baseURL: config.public.apiBaseUrl,
        params,
        headers: {
          Accept: "application/json", // Adding Accept header for JSON response
          "Content-Type": "application/json",
          Authorization: "Bearer " + authToken,
          // Add more headers if needed
        },
      });
      const result: ApiResponse<T> = {
        data: data?.data,
        messages: data?.messages,
        status: data?.status,
      };
      return result;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return {
        data: null as unknown as T,
        messages: (error as Error).message,
        status: "error",
      };
    }
  }

  async function post<T>(
    endpoint: string,
    payload: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<ApiResponse<T>>(endpoint, {
        baseURL: config.public.apiBaseUrl,
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json", // Adding Accept header for JSON response
          "Content-Type": "application/json",
          Authorization: "Bearer " + authToken,
          // Add more headers if needed
        },
      });
      const result: ApiResponse<T> = {
        data: data?.data,
        messages: data?.messages,
        status: data?.status,
      };
      return result;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      return { data: null as unknown as T, messages: (error as Error).message };
    }
  }

  return { get, post };
}
