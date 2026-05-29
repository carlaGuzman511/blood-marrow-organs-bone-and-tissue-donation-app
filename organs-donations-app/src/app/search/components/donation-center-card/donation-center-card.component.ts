import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'donation-center-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './donation-center-card.component.html',
  styleUrl: './donation-center-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationCenterCardComponent {
  @Input() items: any[] = [];
  
  getDonationTypesNames(item: any): string {
    return item.donationTypes?.map((dt: any) => dt.name).join(', ') || '';
  }
}