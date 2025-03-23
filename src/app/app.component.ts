import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { InstrumentsTableComponent } from './components/instruments-table/instruments-table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @ViewChild('instrumentsTable') instrumentsTable!: InstrumentsTableComponent;

  filterText: string = '';
  isDarkTheme: boolean = false;

  onFilterChanged(filter: string): void {
    this.filterText = filter;
  }

  toggleTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
  }
}
