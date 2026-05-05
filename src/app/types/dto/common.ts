export type PageDto<T> = {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type SortDirectionDto = 'asc' | 'desc';

