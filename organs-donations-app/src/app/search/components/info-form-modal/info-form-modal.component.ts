import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../../services/home.service';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BloodType, Donation, City, DonationCenter } from '../../../models/DonationPost';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'info-app-form-modal',
  imports: [
    ReactiveFormsModule,
    GoogleMapsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    CommonModule,
    MatButtonModule],
  templateUrl: './request-form-modal.component.html',
  styleUrl: './request-form-modal.component.css'
})

export class InfoFormModalComponent implements OnInit {  
  donationForm: FormGroup;
  bloodTypes: BloodType[] = [];
  donationCenters: DonationCenter[] = [];
  donationTypes: Donation[] = [];
  
  isLoading: boolean = false;
  cities: City[] = [];

  markerPosition: google.maps.LatLngLiteral = { lat: -17.3895, lng: -66.1568 };
  mapOptions: google.maps.MapOptions = {
    center: this.markerPosition, 
    zoom: 14,
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<InfoFormModalComponent>,
    private homeService: HomeService, 
    private snackBar: MatSnackBar)
  {
      this.donationForm = this.formBuilder.group({
        bloodTypeId: [null, Validators.required],
        donationTypeId: [null, Validators.required],
        donationCenterId: [null, Validators.required],
        description: [''],
        image: [null],
        // location: [this.markerPosition, Validators.required],
      });
  }

  ngOnInit(): void {
    this.getBloodTypes();
    this.getDonationCenters();
    this.getDonationTypes();
  }

  onFileSelected(event: Event): void
  {
    let selectedImageBase64: string | null = null;
    const input = event.target as HTMLInputElement;

    if(input.files && input.files.length > 0)
    {
      const file: File = input.files[0];
      const reader: FileReader = new FileReader();

      reader.onload = () => {
        selectedImageBase64 = reader.result as string;
        this.donationForm.patchValue({ image: selectedImageBase64 });
      };

      reader.onerror = (error) => {
        console.log("error reading file", error);
      };
      
      reader.readAsDataURL(file);
    }    
  }

  onMapClick(event: google.maps.MapMouseEvent): void
  {
    if(event.latLng){
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.markerPosition = { lat, lng };
      this.donationForm.patchValue({ location: this.markerPosition });
    }
  }

  submit(): void
  {
    if(this.donationForm.valid)
    {
      this.dialogRef.close(this.donationForm.value);
    }
  }

  close(): void
  {
    this.dialogRef.close();
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
      }
    )
  }
}
