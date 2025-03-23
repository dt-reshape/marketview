import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

type Theme = 'dark' | 'light';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  @Output() themeToggled = new EventEmitter<boolean>();

  isDarkTheme: boolean = false;
  private mediaQueryList!: MediaQueryList;

  constructor() {}

  ngOnInit(): void {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      this.isDarkTheme = storedTheme === 'dark';
    } else {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkTheme = this.mediaQueryList.matches;
    }
    this.applyTheme();
    this.themeToggled.emit(this.isDarkTheme);
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
    this.themeToggled.emit(this.isDarkTheme);
  }

  applyTheme(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList) {
      this.mediaQueryList.onchange = null;
    }
  }
}
