import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Donation } from '../models/DonationPost';

@Injectable({
  providedIn: 'root'
})
export class InformationService {
  private apiUrl: string = "https://blood-marrow-organs-bone-and-tissue.onrender.com/api";

  constructor(private httpService: HttpClient) { }

  saveDonationTypes(donationType: Donation){
    return this.httpService.post<Donation>(`${this.apiUrl}/donation-types`, donationType);
  }

  getDonationTypes(){
    return this.httpService.get<Donation[]>(`${this.apiUrl}/donation-types`);
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
