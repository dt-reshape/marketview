import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Instrument } from '../../models/instrument.model';
import { BinanceRestTicker, BinanceWsTicker } from '../../models/binance-api.model';
import { BybitRestResponse, BybitWsResponse } from '../../models/bybit-api.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { API_CONSTANTS, Exchange } from '../../constants/api.constants';

@Component({
  selector: 'app-instruments-table',
  templateUrl: './instruments-table.component.html',
  styleUrls: ['./instruments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstrumentsTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filterText: string = '';
  @Input() isDarkTheme: boolean = false;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  public currentExchange: Exchange;
  public serverTimestamp: number | null = null;
  public errorMessage: string | null = null;

  private filterText$ = new BehaviorSubject<string>('');
  private instrumentsSubject = new BehaviorSubject<Instrument[]>([]);
  private debouncedInstruments$ = this.instrumentsSubject.pipe(debounceTime(API_CONSTANTS.INSTRUMENTS_DEBOUNCE_TIME));
  public filteredTickers$: Observable<Instrument[]> = combineLatest([this.debouncedInstruments$, this.filterText$]).pipe(
    debounceTime(API_CONSTANTS.DEBOUNCE_TIME),
    map(([instruments, filterText]) => {
      let filtered = instruments;
      if (filterText) {
        filtered = filtered.filter(instr => instr.symbol.toLowerCase().includes(filterText.toLowerCase()));
      }
      return filtered.filter(instr => parseFloat(instr.lastPrice) > 0);
    })
  );

  public isLoading: boolean = true;
  public currentSortColumn: 'symbol' | 'lastPrice' | 'volumeQuote' | 'priceChangePercent' | 'highPrice' | 'lowPrice' = 'symbol';
  public sortAscending: boolean = true;

  private wsSubject: WebSocketSubject<unknown> | null = null;
  private wsSubscription: Subscription | null = null;
  private filteredTickersSubscription: Subscription | null = null;
  private visibleRange = { start: 0, end: API_CONSTANTS.VISIBLE_RANGE_SIZE };
  private subscribedSymbols = new Set<string>();
  private isWsConnected = false;
  private isWsConnecting = false;

  constructor(private cd: ChangeDetectorRef, private http: HttpClient) {
    this.currentExchange = (localStorage.getItem(API_CONSTANTS.STORAGE_KEY) as Exchange) || API_CONSTANTS.DEFAULT_EXCHANGE;
  }

  ngOnInit() {
    this.loadInitialData();
    this.filteredTickersSubscription = this.filteredTickers$.subscribe(filteredTickers => {
      this.updateWebSocketSubscriptions(filteredTickers);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterText']) {
      this.filterText$.next(this.filterText);
      this.visibleRange = { start: 0, end: API_CONSTANTS.VISIBLE_RANGE_SIZE };
    }
  }

  switchExchange(exchange: Exchange) {
    this.currentExchange = exchange;
    localStorage.setItem(API_CONSTANTS.STORAGE_KEY, exchange);
    this.isLoading = true;
    this.closeWebSocket();
    this.subscribedSymbols.clear();
    this.isWsConnected = false;
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    const restUrl = this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE ? API_CONSTANTS.BINANCE_REST_URL : API_CONSTANTS.BYBIT_REST_URL;

    this.http.get<unknown>(restUrl).subscribe({
      next: response => {
        let instruments: Instrument[] = [];
        if (this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE && Array.isArray(response)) {
          instruments = (response as BinanceRestTicker[]).map(item => ({
            symbol: item.symbol,
            lastPrice: item.lastPrice,
            volume: item.volume,
            volumeQuote: item.quoteVolume,
            priceChangePercent: item.priceChangePercent,
            highPrice: item.highPrice,
            lowPrice: item.lowPrice
          })).slice(0, API_CONSTANTS.MAX_INSTRUMENTS);
          this.serverTimestamp = response[0]?.closeTime || null;
        } else if (this.currentExchange === API_CONSTANTS.EXCHANGES.BYBIT && (response as BybitRestResponse).result?.list) {
          instruments = (response as BybitRestResponse).result.list.map(item => ({
            symbol: item.symbol,
            lastPrice: item.lastPrice,
            volume: item.volume24h,
            volumeQuote: item.turnover24h,
            priceChangePercent: (+item.price24hPcnt * 100).toFixed(2),
            highPrice: item.highPrice24h,
            lowPrice: item.lowPrice24h
          })).slice(0, API_CONSTANTS.MAX_INSTRUMENTS);
          this.serverTimestamp = (response as BybitRestResponse).time;
        }
        this.instrumentsSubject.next(this.sortData(instruments));
        this.isLoading = false;
        this.cd.markForCheck();
        this.setupWebSocket();
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить данные';
        this.isLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  setupWebSocket() {
    const wsUrl = this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE ? API_CONSTANTS.BINANCE_WS_URL : API_CONSTANTS.BYBIT_WS_URL;

    if (this.isWsConnecting || this.isWsConnected) return;

    if (this.wsSubject) this.closeWebSocket();

    this.isWsConnecting = true;
    this.wsSubject = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          this.isWsConnected = true;
          this.isWsConnecting = false;
          this.updateWebSocketSubscriptions(this.instrumentsSubject.value);
        }
      },
      closeObserver: {
        next: () => {
          this.isWsConnected = false;
          this.isWsConnecting = false;
          setTimeout(() => this.setupWebSocket(), API_CONSTANTS.WS_RECONNECT_DELAY);
        }
      }
    });

    this.wsSubscription = this.wsSubject.subscribe(
      msg => this.handleWebSocketMessage(msg),
      err => console.error('WebSocket error:', err)
    );
  }

  private closeWebSocket() {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    if (this.wsSubject) this.wsSubject.complete();
    this.wsSubscription = null;
    this.wsSubject = null;
    this.isWsConnected = false;
    this.isWsConnecting = false;
  }

  private updateWebSocketSubscriptions(filteredTickers: Instrument[]) {
    if (!this.isWsConnected || !this.wsSubject) return;

    const visibleTickers = filteredTickers.slice(this.visibleRange.start, this.visibleRange.end);
    if (visibleTickers.length === 0) {
      const toUnsubscribe = [...this.subscribedSymbols];
      if (toUnsubscribe.length > 0) {
        this.unsubscribeSymbols(toUnsubscribe);
        this.subscribedSymbols.clear();
      }
      return;
    }

    const newSymbols = new Set(visibleTickers.map(t => t.symbol));
    const toUnsubscribe = [...this.subscribedSymbols].filter(s => !newSymbols.has(s));
    const toSubscribe = [...newSymbols].filter(s => !this.subscribedSymbols.has(s));

    if (toUnsubscribe.length > 0) this.unsubscribeSymbols(toUnsubscribe);
    if (toSubscribe.length > 0) this.subscribeSymbols(toSubscribe);

    toUnsubscribe.forEach(s => this.subscribedSymbols.delete(s));
    toSubscribe.forEach(s => this.subscribedSymbols.add(s));
  }

  private subscribeSymbols(symbols: string[]) {
    if (this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE) {
      this.wsSubject!.next({ method: 'SUBSCRIBE', params: symbols.map(s => `${s.toLowerCase()}@ticker`), id: Date.now() });
    } else if (this.currentExchange === API_CONSTANTS.EXCHANGES.BYBIT) {
      this.wsSubject!.next({ op: 'subscribe', args: symbols.map(s => `tickers.${s}`) });
    }
  }

  private unsubscribeSymbols(symbols: string[]) {
    if (this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE) {
      this.wsSubject!.next({ method: 'UNSUBSCRIBE', params: symbols.map(s => `${s.toLowerCase()}@ticker`), id: Date.now() });
    } else if (this.currentExchange === API_CONSTANTS.EXCHANGES.BYBIT) {
      this.wsSubject!.next({ op: 'unsubscribe', args: symbols.map(s => `tickers.${s}`) });
    }
  }

  handleWebSocketMessage(msg: unknown) {
    let newTicker: Instrument | undefined;
    if (this.currentExchange === API_CONSTANTS.EXCHANGES.BINANCE && (msg as { data?: BinanceWsTicker }).data) {
      const data = (msg as { data: BinanceWsTicker }).data;
      newTicker = {
        symbol: data.s,
        lastPrice: data.c,
        volume: data.v,
        volumeQuote: data.q,
        priceChangePercent: data.P,
        highPrice: data.h,
        lowPrice: data.l
      };
    } else if (this.currentExchange === API_CONSTANTS.EXCHANGES.BYBIT && (msg as BybitWsResponse).data && ((msg as BybitWsResponse).type === 'snapshot' || (msg as BybitWsResponse).type === 'delta')) {
      const data = (msg as BybitWsResponse).data;
      newTicker = {
        symbol: data.symbol,
        lastPrice: data.lastPrice,
        volume: data.volume24h,
        volumeQuote: data.turnover24h,
        priceChangePercent: (+data.price24hPcnt * 100).toFixed(2),
        highPrice: data.highPrice24h,
        lowPrice: data.lowPrice24h
      };
    }

    if (newTicker) {
      const currentTickers = this.instrumentsSubject.value;
      const index = currentTickers.findIndex(t => t.symbol === newTicker.symbol);
      if (index >= 0 && parseFloat(newTicker.lastPrice) > 0) {
        currentTickers[index] = { ...currentTickers[index], ...newTicker };
        this.instrumentsSubject.next([...currentTickers].slice(0, API_CONSTANTS.MAX_INSTRUMENTS));
      }
    }
  }

  sortByColumn(column: 'symbol' | 'lastPrice' | 'volumeQuote' | 'priceChangePercent' | 'highPrice' | 'lowPrice') {
    this.currentSortColumn = column;
    this.sortAscending = this.currentSortColumn === column ? !this.sortAscending : true;
    this.instrumentsSubject.next(this.sortData(this.instrumentsSubject.value));
  }

  private sortData(data: Instrument[]): Instrument[] {
    return data.sort((a, b) => {
      if (this.currentSortColumn === 'symbol') {
        return this.sortAscending ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
      }
      const aValue = parseFloat(a[this.currentSortColumn] || '0');
      const bValue = parseFloat(b[this.currentSortColumn] || '0');
      return this.sortAscending ? aValue - bValue : bValue - aValue;
    });
  }

  onScroll(startIndex: number) {
    this.visibleRange = { start: startIndex, end: startIndex + API_CONSTANTS.VISIBLE_RANGE_SIZE };
    this.filteredTickers$.pipe(debounceTime(API_CONSTANTS.DEBOUNCE_TIME)).subscribe(filteredTickers => {
      this.updateWebSocketSubscriptions(filteredTickers);
    });
  }

  trackBySymbol(index: number, ticker: Instrument): string {
    return ticker.symbol;
  }

  ngOnDestroy() {
    this.closeWebSocket();
    if (this.filteredTickersSubscription) this.filteredTickersSubscription.unsubscribe();
  }
}
