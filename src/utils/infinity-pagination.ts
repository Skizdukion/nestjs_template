import { PaginationOptions } from './types/pagination-options';

export const infinityPagination = <T>(
  data: T[],
  total: number,
  options: PaginationOptions,
) => {
  return {
    data,
    total,
    options,
    hasNextPage: data.length === options.limit,
  };
};
