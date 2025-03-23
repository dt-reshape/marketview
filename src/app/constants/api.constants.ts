export const API_CONSTANTS = {
  BINANCE_REST_URL: 'https://api.binance.com/api/v3/ticker/24hr',
  BYBIT_REST_URL: 'https://api.bybit.com/v5/market/tickers?category=spot',
  BINANCE_WS_URL: 'wss://stream.binance.com:9443/stream',
  BYBIT_WS_URL: 'wss://stream.bybit.com/v5/public/spot',
  MAX_INSTRUMENTS: 1000,
  WS_RECONNECT_DELAY: 2000,
  DEBOUNCE_TIME: 300,
  INSTRUMENTS_DEBOUNCE_TIME: 100,
  VISIBLE_RANGE_SIZE: 10,
  DEFAULT_EXCHANGE: 'binance' as const,
  STORAGE_KEY: 'selectedExchange',
  EXCHANGES: {
    BINANCE: 'binance' as const,
    BYBIT: 'bybit' as const
  }
};

export type Exchange = typeof API_CONSTANTS.EXCHANGES[keyof typeof API_CONSTANTS.EXCHANGES];
