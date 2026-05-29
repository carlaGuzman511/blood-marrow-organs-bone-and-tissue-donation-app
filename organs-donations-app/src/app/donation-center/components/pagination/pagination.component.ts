import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  next() {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  prev() {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goTo(page: number) {
    this.pageChange.emit(page);
  }
}