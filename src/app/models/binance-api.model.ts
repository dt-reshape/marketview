export interface BinanceRestTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface BinanceWsTicker {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // Previous close price
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Bid price
  B: string; // Bid quantity
  a: string; // Ask price
  A: string; // Ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
  q: string; // Quote volume
  O: number; // Open time
  C: number; // Close time
  F: number; // First trade ID
  L: number; // Last trade ID
  n: number; // Number of trades
}
