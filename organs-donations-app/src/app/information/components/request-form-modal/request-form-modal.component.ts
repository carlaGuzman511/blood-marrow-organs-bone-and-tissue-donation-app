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
import { Donation } from '../../../models/DonationPost';
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
  isLoading: boolean = false;
  title: string = "Crear Tipo de Donacion";

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Donation
  )
  {
      this.donationForm = this.formBuilder.group({
        id: null,
        name: ['', Validators.required],
        description: ['', Validators.required],
        requirements: ['', Validators.required],
        process: ['', Validators.required],
        image: [null],
        importance: ['', Validators.required],
        benefits: ['', Validators.required],
        secondaryEffects: ['', Validators.required],
      });
  }

  ngOnInit(): void {
    if(this.data)
    {
      this.title = "Editar Tipo de Donacion";
      this.donationForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        requirements: this.data.requirements,
        process: this.data.process,
        importance: this.data.importance,
        description: this.data.description,
        benefits: this.data.benefits,
        secondaryEffects: this.data.secondaryEffects,
        image: this.data.image,
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
        this.donationForm.patchValue({ image: selectedImageBase64 });
      };

      reader.onerror = (error) => {
        console.log("error reading file", error);
      };
      
      reader.readAsDataURL(file);
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
}
