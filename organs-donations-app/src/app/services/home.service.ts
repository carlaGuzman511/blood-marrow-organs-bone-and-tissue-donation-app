import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BloodType, DonationCenter, DonationPost, User } from '../models/DonationPost';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl: string = "https://blood-marrow-organs-bone-and-tissue.onrender.com/api";

  constructor(private httpService: HttpClient) { }

  deleteDonationPostByUser(donationPostId: string, userId: string)
  {
    return this.httpService.delete<DonationPost>(`${this.apiUrl}/users/${userId}/donation-posts/${donationPostId}`);
  }

  deleteDonationPostByDonationCenter(donationPostId: string, donationCenterId: string)
  {
    return this.httpService.delete<DonationPost>(`${this.apiUrl}/donation-centers/${donationCenterId}/donation-posts/${donationPostId}`);
  }

  updateDonationPostByUser(donationPostId: string, userId: string, donationPost: DonationPost)
  {
    return this.httpService.put<DonationPost>(`${this.apiUrl}/users/${userId}/donation-posts/${donationPostId}`, donationPost);
  }

  updateDonationPostByDonationCenter(donationPostId: string, donationCenterId: string, donationPost: DonationPost)
  {
    return this.httpService.put<DonationPost>(`${this.apiUrl}/donation-centers/${donationCenterId}/donation-posts/${donationPostId}`, donationPost);
  }

  getDonationPosts(){
    return this.httpService.get<DonationPost[]>(`${this.apiUrl}/donation-posts`);
  }
  
  saveDonationCenterPosts(id: string, donationPost: DonationPost){
    return this.httpService.post<DonationPost>(`${this.apiUrl}/donation-centers/${id}/donation-posts`, donationPost);
  }

  saveDonationUserPosts(id: string, donationPost: DonationPost){
    return this.httpService.post<DonationPost>(`${this.apiUrl}/users/${id}/donation-posts`, donationPost);
  }
  
  getBloodTypes(){
    return this.httpService.get<BloodType[]>(`${this.apiUrl}/blood-types`);
  }

  getDonationCenters(){
    return this.httpService.get<DonationCenter[]>(`${this.apiUrl}/donation-centers`);
  }

  getUsers(){
      return this.httpService.get<User[]>(`${this.apiUrl}/users`);
  }
}
