import { Component, OnInit, Inject } from '@angular/core';
import { HomeService } from '../../../services/home.service';
import { InformationService } from '../../../services/information.service';
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BloodType, Donation, City, DonationCenter, DonationPost } from '../../../models/DonationPost';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'request-app-form-modal',
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
export class RequestFormModalComponent implements OnInit {  
  donationForm: FormGroup;
  bloodTypes: BloodType[] = [];
  donationCenters: DonationCenter[] = [];
  donationTypes: Donation[] = [];
  
  isLoading: boolean = false;
  cities: City[] = [];
  title: string = "Crear Solicitud";
  markerPosition: google.maps.LatLngLiteral = { lat: -17.3895, lng: -66.1568 };
  mapOptions: google.maps.MapOptions = {
    center: this.markerPosition, 
    zoom: 14,
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormModalComponent>,
    private homeService: HomeService, 
    private informationService: InformationService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DonationPost
  )
  {
      this.donationForm = this.formBuilder.group({
        id: null,
        bloodTypeId: [null, Validators.required],
        donationTypeId: [null, Validators.required],
        donationCenterId: [null, Validators.required],
        description: [''],
        image: [null],
        // location: [this.markerPosition, Validators.required],
      });
  }

  ngOnInit(): void {
    if(this.data)
    {
      this.title = "Editar Solicitud";
      this.donationForm.patchValue({
        id: this.data.id,
        bloodTypeId: this.data.bloodType?.id,
        donationTypeId: this.data.donationType?.id,
        donationCenterId: this.data.donationCenter?.id,
        description: this.data.description,
        image: this.data.image
      });
    }

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
    UpdateDonationCenterPost(id: string, donationPost: DonationPost): void
  {
    this.homeService.updateDonationPostByDonationCenter(donationPost.id, id, donationPost)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error updating donation post, ${error}`, 'Close', { duration: 2500 });
            return of();
          }),
          finalize(() => {
            this.snackBar.open('la solicitud de donacion se ha actualizado correctamente..!', 'Close', { duration: 3500 });
          })
        )
        .subscribe((response) => {
          console.log(response);
        });
  }

  UpdateUserPost(id: string, donationPost: DonationPost): void
  {
    this.homeService.updateDonationPostByUser(donationPost.id, id, donationPost)
        .pipe(
          catchError(error => {
            this.snackBar.open(`Error updating donation post, ${error}`, 'Close', { duration: 2500 });
            return of();
          }),
          finalize(() => {
            this.snackBar.open('la solicitud de donacion se ha actualizado correctamente..!', 'Close', { duration: 3500 });
          })
        )
        .subscribe((response) => {
          console.log(response);
        });
  }

}
