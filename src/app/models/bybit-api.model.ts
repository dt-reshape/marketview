export interface BybitRestResponse {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: BybitRestTicker[];
  };
  retExtInfo: Record<string, any>;
  time: number;
}

export interface BybitRestTicker {
  symbol: string;
  bid1Price: string;
  bid1Size: string;
  ask1Price: string;
  ask1Size: string;
  lastPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  volume24h: string;
}

export interface BybitWsResponse {
  topic: string;
  ts: number;
  type: string;
  cs?: number; // Checksum
  data: BybitWsTicker;
}

export interface BybitWsTicker {
  symbol: string;
  lastPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  prevPrice24h: string;
  volume24h: string;
  turnover24h: string;
  price24hPcnt: string;
  usdIndexPrice?: string;
}
