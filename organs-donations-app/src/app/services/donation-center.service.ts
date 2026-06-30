import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DonationCenter } from '../models/DonationPost';

@Injectable({
  providedIn: 'root'
})
export class DonationCenterService {
  private apiUrl: string = "https://blood-marrow-organs-bone-and-tissue.onrender.com/api";

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
