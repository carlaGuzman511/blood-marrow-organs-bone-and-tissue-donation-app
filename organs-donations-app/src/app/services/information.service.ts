import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Donation } from '../models/DonationPost';
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
