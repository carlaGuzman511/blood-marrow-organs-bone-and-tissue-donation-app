import { Component, OnInit } from '@angular/core';
import { DonationCenter } from '../models/DonationPost';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DonationCenterService } from '../services/donation-center.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { RequestFormModalComponent } from './components/request-form-modal/request-form-modal.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-donation-center',
  imports: [
    CommonModule, 
    CardComponent, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatProgressSpinnerModule],
  templateUrl: './donation-center.component.html',
  styleUrl: './donation-center.component.css'
})
export class DonationCenterComponent implements OnInit {
  donationCenters: DonationCenter[] = [];
  isLoading: boolean = false;
  showForm: boolean = false;
  donationCenterForm: FormGroup = new FormGroup({
    address: new FormControl(''),
    name: new FormControl(''),
    latitude: new FormControl(''),
    longitude: new FormControl(''),
    image: new FormControl(''),
    city: new FormControl(''),
    // donationTypes: new FormControl(''),
  });
  pageSize = 10;
  currentPage = 0;

  get paginatedItems() {
    const start = this.currentPage * this.pageSize;
    return this.donationCenters.slice(start, start + this.pageSize);
  }

  constructor(
    private donationCenterService: DonationCenterService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getDonationCenters();
  }
  
  onPageChange(page: number) {
    this.currentPage = page;
  }

  saveDonationCenter(donationCenter: DonationCenter): void
  {
    this.donationCenterService.saveDonationCenter(donationCenter)
    .pipe(
          catchError(error => {
            this.snackBar.open(`Error saving donation center ${error}`, 'Close', { duration: 2500 });
            return of();
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe((response) => {
          console.log(response);
        });
  }

  openDonationCenterForm(): void
  {
      const dialogRef = this.dialog.open(RequestFormModalComponent);
  
      dialogRef.afterClosed()
      .subscribe(result => {
        if(result)
        {
          if (!result?.id)
          {
            this.saveDonationCenter(result);
          }
        }})
    }

  removeItem(donation: DonationCenter): void {
    if(donation.id != null) {
      this.donationCenterService.deleteDonationCenter(donation.id)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error deleting donation center ${error}`, 'Close', { duration: 2500 });
            return of();
          }),
          finalize(() => {})
        )
        .subscribe(() => {});
    }
  }
  
  editItem(item: DonationCenter): void
  {
    const dialogRef = this.dialog.open(RequestFormModalComponent, {
      data: item,
    });
   
       dialogRef.afterClosed()
       .subscribe(result => {
         if(result)
         {
           this.donationCenterService
           .updateDonationCenter(result.id, result)
            .subscribe({
              next: (response) => {
                console.log('updated', response);
              },
              error: (err) => {
                console.error('error', err);
              }
            });
         }}) 
  }

  getDonationCenters(): void {
    this.isLoading = true;
    this.donationCenterService.getDonationCenters()
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

  addRequest(): void{
    this.showForm = true;
  }
}