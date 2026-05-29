import { Component, OnInit } from '@angular/core';
import { Donation } from '../models/DonationPost';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InformationService } from '../services/information.service';
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
  selector: 'app-information',
  imports: [
    CommonModule, 
    CardComponent, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatProgressSpinnerModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css'
})
export class InformationComponent implements OnInit {
  donationTypes: Donation[] = [];
  isLoading: boolean = false;
  showForm: boolean = false;
  donationForm: FormGroup = new FormGroup({
    description: new FormControl(''),
    requirements: new FormControl(''),
    process: new FormControl(''),
    image: new FormControl(''),
    importance: new FormControl(''),
    benefits: new FormControl(''),
    secondaryEffects: new FormControl(''),
  });

  constructor(
    private informationService: InformationService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getDonationTypes();
  }

  saveDonationType(donationType: Donation): void
  {
    this.informationService.saveDonationTypes(donationType)
    .pipe(
          catchError(error => {
            this.snackBar.open(`Error saving donation types ${error}`, 'Close', { duration: 2500 });
            return of([]);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe((response) => {
          console.log(response);
        });
  }

  openDonationForm(): void
  {
      const dialogRef = this.dialog.open(RequestFormModalComponent);
  
      dialogRef.afterClosed()
      .subscribe(result => {
        if(result)
        {
          if (!result?.id)
          {
            this.saveDonationType(result);
          }
        }})
    }

  removeItem(donation: Donation): void {
    if(donation.id != null) {
      this.informationService.deleteDonationTypes(donation.id)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error deleting donation types ${error}`, 'Close', { duration: 2500 });
            return of();
          }),
          finalize(() => {})
        )
        .subscribe(() => {});
    }
  }
  
  editItem(item: Donation): void
  {
    const dialogRef = this.dialog.open(RequestFormModalComponent, {
      data: item,
    });
   
       dialogRef.afterClosed()
       .subscribe(result => {
         if(result)
         {
           this.informationService
           .updateDonationTypes(result.id, result)
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

  getDonationTypes(): void {
    this.isLoading = true;
    this.informationService.getDonationTypes()
      .pipe(
        catchError(error => {
          this.snackBar.open(`Error fetching donation types ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.donationTypes = data;
      });
    }

  addRequest(): void{
    this.showForm = true;
  }
}