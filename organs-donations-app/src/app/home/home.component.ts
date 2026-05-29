import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RequestFormModalComponent } from './components/request-form-modal/request-form-modal.component';
import { CardComponent } from './components/card/card.component';
import { HomeService } from '../services/home.service';
import { DonationPost } from '../models/DonationPost';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule, 
    CardComponent, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  donationPosts: DonationPost[] = [];
  isLoading: boolean = false;
  showForm: boolean = false;
  requestForm: FormGroup = new FormGroup({
    phone: new FormControl(''),
    image: new FormControl(''),
    address: new FormControl(''),
    userId: new FormControl(''),
    city: new FormControl(''),
    hospitalId: new FormControl(''),
    donationTypeId: new FormControl(''),
    note: new FormControl(''),
  });

  constructor(
    private homeService: HomeService, 
    private snackBar: MatSnackBar, 
    private dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.getDonationPosts();
  }

  editItem(item: DonationPost)
  {
    const dialogRef = this.dialog.open(RequestFormModalComponent, {
      data: item,
    });
   
       dialogRef.afterClosed()
       .subscribe(result => {
         if(result && item.donationCenter)
         {
           this.homeService
            .updateDonationPostByDonationCenter(item.id, item.donationCenter?.id, result)
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

  removeItem(item: DonationPost)
  {
    if(item.donationCenter)
    {
      this.homeService.deleteDonationPostByDonationCenter(item.id, item.donationCenter?.id)
          .pipe(
            catchError(error => {
                this.snackBar.open(`Error eliminando la solicitud de donacion, ${error}`, 'Close', { duration: 2500 });
                return of();
              }),
              finalize(() => {})
            )
            .subscribe(() => {
                this.snackBar.open(`La solicitud de donacion fue eliminada correctamente..!`, 'Close', { duration: 2500 });
            })
    }
  }

  saveDonationCenterPost(id: string, donationPost: DonationPost): void
  {
    this.homeService.saveDonationCenterPosts(id, donationPost)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error saving donation posts ${error}`, 'Close', { duration: 2500 });
            return of([]);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe((response) => {
          console.log(response);
        });
  }

  saveUserPost(id: string, donationPost: DonationPost): void
  {
    this.homeService.saveDonationCenterPosts(id, donationPost)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error saving donation posts ${error}`, 'Close', { duration: 2500 });
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
            this.snackBar.open('la solicitud de donacion se ha creado correctamente!', 'Close', { duration: 3500 });
          })
        )
        .subscribe((response) => {
          console.log(response);
        });
  }
  
  openDonationForm(): void
  {
    const id: string = "30B619F7-B8E6-47A1-B881-5F2141BB7D77";
    const dialogRef = this.dialog.open(RequestFormModalComponent);

    dialogRef.afterClosed()
    .subscribe(result => {
      if(result)
      {
        if (!result?.id)
        {
          this.saveDonationCenterPost(id, result);
        }
      }})
  }

  getDonationPosts(): void {
    this.isLoading = true;
    this.homeService.getDonationPosts()
      .pipe(
        catchError(error => {
          this.snackBar.open(`Error fetching donation posts ${error}`, 'Close', { duration: 2500 });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data) => {
        this.donationPosts = data;
      });
  }

  addRequest(): void{
    this.showForm = true;
  }
}
