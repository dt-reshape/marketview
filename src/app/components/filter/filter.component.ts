import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
  filterText: string = '';
  @Output() filterChanged = new EventEmitter<string>();

  onInputChange(value: string): void {
    this.filterText = value;
    this.filterChanged.emit(this.filterText);
  }
}
