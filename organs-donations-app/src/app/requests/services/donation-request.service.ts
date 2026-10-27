import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DonationRequest,
  DonationRequestBody,
  DonationRequestPage,
  DonationRequestQuery,
  RequestStatus,
} from '../../models/DonationRequest';

/** /api/donation-requests: the board, its filters, publishing and phase changes. */
@Injectable({ providedIn: 'root' })
export class DonationRequestService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/donation-requests`;

  /** Empty filters are dropped; several blood types repeat the key (?bloodTypeId=a&bloodTypeId=b). */
  static toParams(query: DonationRequestQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        for (const item of value) params = params.append(key, String(item));
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  list(query: DonationRequestQuery): Observable<DonationRequestPage> {
    return this.http.get<DonationRequestPage>(this.url, { params: DonationRequestService.toParams(query) });
  }

  create(body: DonationRequestBody): Observable<DonationRequest> {
    return this.http.post<DonationRequest>(this.url, body);
  }

  changeStatus(id: string, status: RequestStatus, reason?: string): Observable<DonationRequest> {
    return this.http.patch<DonationRequest>(`${this.url}/${id}/status`, { status, reason: reason || null });
  }
}

/** Field errors of an RFC 7807 400 (`errors`), keyed by camelCase property name. */
export function problemFieldErrors(error: unknown): Record<string, string> {
  const errors = (error as HttpErrorResponse)?.error?.errors;
  if (!errors || typeof errors !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(errors as Record<string, string[]>)) {
    const field = key.charAt(0).toLowerCase() + key.slice(1);
    result[field] = Array.isArray(messages) ? messages[0] : String(messages);
  }
  return result;
}

/** A readable message for an API error (problem+json detail/title, or a status-based fallback). */
export function problemMessage(error: unknown, fallback: string): string {
  const http = error as HttpErrorResponse;
  const body = http?.error;
  if (http?.status === 0) return 'Sin conexión con el servidor. Revisa tu red e inténtalo de nuevo.';
  if (typeof body?.detail === 'string' && body.detail) return body.detail;
  if (http?.status === 403) return 'No tienes permiso para esta acción.';
  if (http?.status === 409) return 'Otra persona cambió esta solicitud. Recarga el tablero.';
  if (typeof body?.title === 'string' && body.title && http?.status !== 400) return body.title;
  return fallback;
}
