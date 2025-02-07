export interface PaginationResponseType {
  message?: string;
  data: any;
  status?: number;
  totalCount?: number;
  nextCursor: string | null;
}
