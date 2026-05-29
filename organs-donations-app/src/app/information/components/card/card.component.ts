import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Comment, Donation } from '../../../models/DonationPost';
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
  @Output() removeItemEvent = new EventEmitter<Donation>();
  @Output() editItemEvent = new EventEmitter<Donation>();
  menu: string[] = [];
  currentUserId: string = "";
  currentIndex = 0;

  constructor(){}

  next() {
    if (this.items.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  prev() {
    if (this.items.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  editItem(item: Donation) {
    this.editItemEvent.emit(item);
  }

  removeItem(item: Donation) {
    this.removeItemEvent.emit(item);
  }
}