
export interface Coin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
  sparkline: number[];
  lastUpdated: Date;
}

export interface MarketData {
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  totalVolume: number;
  circulatingSupply: number;
  maxSupply: number | null;
}

export interface CoinDetail extends Coin {
  description: string;
  website: string;
  twitter: string;
  reddit: string;
  github: string;
  marketData: MarketData;
  contractAddress?: string;
}

export type TimeFrame = '1h' | '24h' | '7d' | '30d' | '90d' | '1y';

export interface CoinChartData {
  timestamps: number[];
  prices: number[];
}

export interface FilterOptions {
  marketCap: string;
  tokenType: string;
  performance: string;
}
