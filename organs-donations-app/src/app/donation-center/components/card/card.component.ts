import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { DonationCenter } from '../../../models/DonationPost';
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatMenuModule, MatIcon, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CardComponent {
  @Input() items: any[] = [];
  @Output() removeItemEvent = new EventEmitter<DonationCenter>();
  @Output() editItemEvent = new EventEmitter<DonationCenter>();
  menu: string[] = [];
  currentUserId: string = "";
  
  constructor(){}

  trackById(index: number, item: DonationCenter) {
    return item.id;
  }

  editItem(item: DonationCenter) {
    this.editItemEvent.emit(item);
  }

  removeItem(item: DonationCenter) {
    this.removeItemEvent.emit(item);
  }
}