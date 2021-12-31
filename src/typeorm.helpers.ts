import { WhereExpression } from 'typeorm';

// TypeORM unfortunately does not support building IN queries
// with empty arrays, hence this workaround as recommended here:
// https://github.com/typeorm/typeorm/issues/2195
export const querySafeAndWhereInIds = <Query extends WhereExpression>(
  query: Query,
  alias: string,
  ids: string[] = [],
): Query => {
  // If no inclusion, return an always zero-results query
  return ids.length ? query.andWhere(`${alias}.id IN (:...ids)`, { ids }) : query.andWhere('1=0');
};

export const querySafeAndWhereNotInIds = <Query extends WhereExpression>(
  query: Query,
  alias: string,
  ids: string[] = [],
): Query => {
  // If no exclusion, return the query as-is
  return ids.length ? query.andWhere(`${alias}.id NOT IN (:...ids)`, { ids }) : query;
};
