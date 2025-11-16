export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  featured?: boolean;
  brand_id?: number;
  category_id?: number;
  type_id?: number;
}
