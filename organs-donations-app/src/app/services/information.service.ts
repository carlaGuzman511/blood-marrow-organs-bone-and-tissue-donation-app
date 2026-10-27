import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Donation, PagedResult, LOOKUP_PAGE_SIZE } from '../models/DonationPost';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InformationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpService: HttpClient) { }

  saveDonationTypes(donationType: Donation){
    return this.httpService.post<Donation>(`${this.apiUrl}/donation-types`, donationType);
  }

  /** All donation types (a small catalog: one page of 100). */
  getDonationTypes(): Observable<Donation[]> {
    return this.httpService
      .get<PagedResult<Donation>>(`${this.apiUrl}/donation-types`, { params: { pageSize: LOOKUP_PAGE_SIZE } })
      .pipe(map(page => page.items));
  }
  
  deleteDonationTypes(donationTypeId: string)
  {
    return this.httpService.delete<Donation>(`${this.apiUrl}/donation-types/${donationTypeId}`);
  }
  
  updateDonationTypes(donationTypeId: string, donationType: Donation)
  {
    return this.httpService.put<Donation>(`${this.apiUrl}/donation-types/${donationTypeId}/`, donationType);
  }
}
