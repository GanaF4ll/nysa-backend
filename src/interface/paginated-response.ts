export interface PaginatedResponse<T> {
  data: any[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}
