import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, signal } from '@angular/core';
import { API_CONSTANTS, Exchange } from '../../constants/api.constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() exchangeName: Exchange = API_CONSTANTS.EXCHANGES.BINANCE;
  @Input() set serverTimestamp(value: number | null) {
    this.currentServerTimestamp.set(value ?? Date.now());
  }

  exchangeTime = signal<string>('');
  serverTime = signal<string>('');
  tooltipServerTime = signal<string>('');

  private currentServerTimestamp = signal<number>(Date.now());
  private timer: any;

  ngOnInit() {
    this.updateTimes();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private tick() {
    this.currentServerTimestamp.update(value => value + 1000);
    this.updateTimes();
  }

  private updateTimes() {
    const now = new Date(this.currentServerTimestamp());
    this.exchangeTime.set(now.toLocaleTimeString());
    this.serverTime.set(now.toUTCString());
    if (this.tooltipServerTime()) {
      this.tooltipServerTime.set(this.serverTime());
    }
  }

  onMouseEnter() {
    this.tooltipServerTime.set(this.serverTime());
  }

  onMouseLeave() {
    this.tooltipServerTime.set('');
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
