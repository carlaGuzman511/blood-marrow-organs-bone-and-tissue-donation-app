import { Component, OnInit, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DonationCenter } from '../../../models/DonationPost';
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
  donationCenterForm: FormGroup;
  isLoading: boolean = false;
  title: string = "Crear Centro de Donacion";

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonationCenter
  )
  {
      this.donationCenterForm = this.formBuilder.group({
        id: null,
        city: ['', Validators.required],
        address: ['', Validators.required],
        latitude: ['', Validators.required],
        name: ['', Validators.required],
        image: [null],
        longitude: ['', Validators.required],
        // donationTypes: ['', Validators.required],
      });
  }

  ngOnInit(): void {
    if(this.data)
    {
      this.title = "Editar Centro de Donacion";
      this.donationCenterForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        address: this.data.address,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        donationTypes: this.data.donationTypes,
        image: this.data.image,
        city: this.data.city,
      });
    }
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
        this.donationCenterForm.patchValue({ image: selectedImageBase64 });
      };

      reader.onerror = (error) => {
        console.log("error reading file", error);
      };
      
      reader.readAsDataURL(file);
    }    
  }

  submit(): void
  {
    if(this.donationCenterForm.valid)
    {
      this.dialogRef.close(this.donationCenterForm.value);
    }
  }

  close(): void
  {
    this.dialogRef.close();
  }
}
