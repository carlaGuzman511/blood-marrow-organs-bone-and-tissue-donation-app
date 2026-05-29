import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { HomeService } from '../../../services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DonationPost } from '../../../models/DonationPost';
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
  @Output() removeItemEvent = new EventEmitter<DonationPost>();
  @Output() editItemEvent = new EventEmitter<DonationPost>();
  menu: string[] = [];
  currentUserId: string = "";

  constructor(private homeService: HomeService, private snackBar: MatSnackBar, private dialog: MatDialog){}
  
  editItem(item: DonationPost) {
    this.editItemEvent.emit(item);
  }

  removeItem(item: DonationPost) {
    this.removeItemEvent.emit(item);
  }

  
  removeComment(item: Comment): void {

  }

  editComment(item: Comment): void {

  }
}