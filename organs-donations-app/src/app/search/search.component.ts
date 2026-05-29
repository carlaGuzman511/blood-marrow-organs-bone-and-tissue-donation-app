import { BloodType, Donation, DonationCenter, User } from '../models/DonationPost';
import { HomeService } from '../services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { catchError, finalize } from 'rxjs/operators';
import { UserCardComponent } from './components/user-card/user-card.component';
import { DonationCenterCardComponent } from './components/donation-center-card/donation-center-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-search',
  imports: [
    UserCardComponent,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule, 
    MatButtonModule,
    DonationCenterCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit{
  donationCenters: DonationCenter[] = [];
  users: User[] = [];
  filteredDonationCenters: DonationCenter[] = [];
  filteredUsers: User[] = [];
  donationTypes: Donation[] = [];
  bloodTypes: BloodType[] = [];
  isLoading: boolean = false;
  searchForm: FormGroup;

  constructor(
    private homeService: HomeService, 
    private snackBar: MatSnackBar, 
    private formBuilder: FormBuilder,)
    {
      this.searchForm = this.formBuilder.group({
        description: [''],
        donationTypeId: [null],
        bloodTypeId: [null],
        donationCenterId: [null],
      });
    }
  
  ngOnInit(): void 
  {
    this.getDonationCenters();
    this.getUsers();
    this.getBloodTypes();
    this.getDonationTypes();
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.filteredUsers = [...this.users];
    this.filteredDonationCenters = [...this.donationCenters];
  }

  submit(): void
  {
    if(this.searchForm.invalid) return;

    const { description, donationTypeId, bloodTypeId, donationCenterId } = this.searchForm.value;
    const desc = description.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {
      const matchDesc = user.fullName?.toLowerCase().includes(desc) || user.address?.toLowerCase().includes(desc);
      const matchBloodType = user.bloodTypeId === bloodTypeId;

      return matchDesc && matchBloodType;
    });

    this.filteredDonationCenters = this.donationCenters.filter(dc => {
      const matchDesc = dc.name?.toLowerCase().includes(desc) || dc.address?.toLowerCase().includes(desc);
      const matchDonationType = dc.donationTypes?.some(dt => dt.id === donationTypeId);
      const matchCenterId = dc.id === donationCenterId;

      return matchDesc && matchDonationType && matchCenterId;
    });
  }

  getBloodTypes(): void
  {
   this.isLoading = true;
   this.homeService.getBloodTypes()
    .pipe(
      catchError(error => {
          this.snackBar.open(`Error fetching blood types ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.bloodTypes = data;
      }
    )
  }

  getDonationTypes(): void
  {
   this.isLoading = true;
   this.homeService.getDonationTypes()
    .pipe(
      catchError(error => {
          this.snackBar.open(`Error fetching donation types ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.donationTypes = data;
      }
    )
  }

  getDonationCenters(): void 
  {
    this.isLoading = true;
    this.homeService.getDonationCenters()
      .pipe(
        catchError(error => {
          this.snackBar.open(`Error fetching donation centers ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.donationCenters = data;
      });
  }

  
  getUsers(): void 
  {
    this.isLoading = true;
    this.homeService.getUsers()
      .pipe(
        catchError(error => {
          this.snackBar.open(`Error fetching users ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.users = data;
      });
  }
}
