export interface ApiResponse<T> {
  data: T | null;
  messages?: string | null;
  status?: string | null;
}
