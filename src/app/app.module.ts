import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { InstrumentsTableComponent } from './components/instruments-table/instruments-table.component';
import { FilterComponent } from './components/filter/filter.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { LoaderComponent } from './components/loader/loader.component';
import { FormatVolumePipe } from './pipes/format-volume.pipe';
import { FormatNumberPipe } from './pipes/format-number.pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    InstrumentsTableComponent,
    FilterComponent,
    ThemeToggleComponent,
    LoaderComponent,
    FormatVolumePipe,
    FormatNumberPipe
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ScrollingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
