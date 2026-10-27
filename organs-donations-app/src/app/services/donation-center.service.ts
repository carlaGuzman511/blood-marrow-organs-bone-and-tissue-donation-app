import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DonationCenter, PagedResult, PageQuery } from '../models/DonationPost';
import { HomeService } from './home.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationCenterService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpService: HttpClient) { }

  /** One page of donation centers, ordered by name. */
  getDonationCenters(query: PageQuery = {}): Observable<PagedResult<DonationCenter>> {
    return this.httpService.get<PagedResult<DonationCenter>>(`${this.apiUrl}/donation-centers`, { params: HomeService.toParams(query) });
  }

  saveDonationCenter(donationCenter: DonationCenter){
    return this.httpService.post<DonationCenter>(`${this.apiUrl}/donation-centers`, donationCenter);
  }
  
  deleteDonationCenter(donationCenterId: string)
  {
    return this.httpService.delete<DonationCenter>(`${this.apiUrl}/donation-centers/${donationCenterId}`);
  }
  
  updateDonationCenter(donationCenterId: string, donationCenter: DonationCenter)
  {
    return this.httpService.put<DonationCenter>(`${this.apiUrl}/donation-centers/${donationCenterId}/`, donationCenter);
  }
}
