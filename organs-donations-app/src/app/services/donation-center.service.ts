import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DonationCenter } from '../models/DonationPost';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationCenterService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpService: HttpClient) { }

  getDonationCenters(){
    return this.httpService.get<DonationCenter[]>(`${this.apiUrl}/donation-centers`);
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
