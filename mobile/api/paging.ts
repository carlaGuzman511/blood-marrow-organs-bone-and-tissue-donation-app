import { api } from "@/api/axios";
import { PagedResult } from "@/models/App.types";

/** Query string of a list endpoint. page starts at 1; pageSize is 1..100 (API default 20). */
export type PageQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  [filter: string]: string | number | boolean | undefined | null;
};

/** Small catalogs (blood types, donation types) fit in one page of this size. */
export const LOOKUP_PAGE_SIZE = 100;

/** Never matches anything: used when the user picked a filter value the API doesn't know. */
export const NO_MATCH_ID = "00000000-0000-0000-0000-000000000000";

/** Drops empty filters so the API only sees what the user chose. */
export function toParams(query: PageQuery): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) params[key] = text;
  }
  return params;
}

/** One page of a list endpoint. */
export async function getPage<T>(url: string, query: PageQuery = {}): Promise<PagedResult<T>> {
  const response = await api.get<PagedResult<T>>(url, { params: toParams(query) });
  return response.data;
}

/** A whole small catalog (one page of up to 100), for pickers and lookups. */
export async function getLookup<T>(url: string): Promise<T[]> {
  return (await getPage<T>(url, { pageSize: LOOKUP_PAGE_SIZE })).items;
}
