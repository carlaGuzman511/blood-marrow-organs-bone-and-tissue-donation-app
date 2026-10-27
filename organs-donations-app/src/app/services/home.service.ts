import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BloodType, DonationCenter, DonationPost, Donor, Donation, PagedResult, PageQuery, LOOKUP_PAGE_SIZE } from '../models/DonationPost';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpService: HttpClient) { }

  /** Drops empty filters so the API only sees what the user chose. */
  static toParams(query: PageQuery = {}): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, `${value}`.trim());
      }
    }
    return params;
  }

  private getLookup<T>(path: string): Observable<T[]> {
    return this.httpService
      .get<PagedResult<T>>(`${this.apiUrl}/${path}`, { params: HomeService.toParams({ pageSize: LOOKUP_PAGE_SIZE }) })
      .pipe(map(page => page.items));
  }

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

  /** One page of the feed, newest first. */
  getDonationPosts(query: PageQuery = {}): Observable<PagedResult<DonationPost>> {
    return this.httpService.get<PagedResult<DonationPost>>(`${this.apiUrl}/donation-posts`, { params: HomeService.toParams(query) });
  }
  
  saveDonationCenterPosts(id: string, donationPost: DonationPost){
    return this.httpService.post<DonationPost>(`${this.apiUrl}/donation-centers/${id}/donation-posts`, donationPost);
  }

  saveDonationUserPosts(id: string, donationPost: DonationPost){
    return this.httpService.post<DonationPost>(`${this.apiUrl}/users/${id}/donation-posts`, donationPost);
  }
  
  /** All blood types, for a dropdown. */
  getBloodTypes(): Observable<BloodType[]> {
    return this.getLookup<BloodType>('blood-types');
  }

  /** All donation types, for a dropdown. */
  getDonationTypes(): Observable<Donation[]> {
    return this.getLookup<Donation>('donation-types');
  }

  /** Donation centers for a dropdown (first 100 by name). */
  getDonationCenters(): Observable<DonationCenter[]> {
    return this.getLookup<DonationCenter>('donation-centers');
  }

  /** One page of donation centers, filtered on the server (search, city, donationTypeId). */
  searchDonationCenters(query: PageQuery = {}): Observable<PagedResult<DonationCenter>> {
    return this.httpService.get<PagedResult<DonationCenter>>(`${this.apiUrl}/donation-centers`, { params: HomeService.toParams(query) });
  }

  /** One page of donors (public fields only), filtered on the server (search, city, bloodTypeId). */
  getDonors(query: PageQuery = {}): Observable<PagedResult<Donor>> {
    return this.httpService.get<PagedResult<Donor>>(`${this.apiUrl}/donors`, { params: HomeService.toParams(query) });
  }
}
