export interface Instrument {
  symbol: string;
  lastPrice: string;
  volume: string; // Объем в базовой валюте (например, BTC)
  volumeQuote: string; // Объем в котируемой валюте (например, USDT)
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
}
