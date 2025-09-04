import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Coin } from "@/types/market";
import { usePriceTransition } from "@/hooks/use-price-transition";
import SparklineChart from "./SparklineChart";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";

interface PriceDisplayProps {
  price: number;
  lastUpdated: Date;
}

const PriceDisplay = ({ price, lastUpdated }: PriceDisplayProps) => {
  const { displayPrice, trend } = usePriceTransition(price);
  
  return (
    <div className={`
      transition-colors duration-500
      ${trend === "up" ? "bg-green-500/20" : ""}
      ${trend === "down" ? "bg-red-500/20" : ""}
    `}>
      <div className="font-medium">{formatCurrency(Number(displayPrice))}</div>
      <div className="text-xs text-muted-foreground">
        {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

interface CryptoTableProps {
  coins: Coin[];
  isLoading: boolean;
  watchlist: string[];
  toggleWatchlist: (coinId: string) => void;
  onSelectCoin: (coin: Coin) => void;
}

type SortKey = 'rank' | 'name' | 'price' | 'priceChange' | 'marketCap' | 'volume' | 'supply';
type SortDirection = 'asc' | 'desc';

const CryptoTable = ({ 
  coins, 
  isLoading, 
  watchlist,
  toggleWatchlist,
  onSelectCoin
}: CryptoTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevPricesRef = useRef<Record<string, number>>({});
  
  const sortedCoins = [...coins].sort((a, b) => {
    let comparison = 0;
    
    switch (sortKey) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.currentPrice - b.currentPrice;
        break;
      case 'priceChange':
        comparison = a.priceChangePercentage24h - b.priceChangePercentage24h;
        break;
      case 'marketCap':
        comparison = a.marketCap - b.marketCap;
        break;
      case 'volume':
        comparison = a.volume24h - b.volume24h;
        break;
      case 'supply':
        if (a.circulatingSupply === null && b.circulatingSupply === null) return 0;
        if (a.circulatingSupply === null) return 1;
        if (b.circulatingSupply === null) return -1;
        comparison = a.circulatingSupply - b.circulatingSupply;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground/50" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };
  
  useEffect(() => {
    const changes: Record<string, 'up' | 'down' | null> = {};
    
    coins.forEach(coin => {
      const prevPrice = prevPricesRef.current[coin.id];
      if (prevPrice && prevPrice !== coin.currentPrice) {
        changes[coin.id] = prevPrice < coin.currentPrice ? 'up' : 'down';
      }
    });
    
    if (Object.keys(changes).length > 0) {
      setPriceChanges(changes);
      
      const timeout = setTimeout(() => {
        setPriceChanges({});
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [coins]);
  
  useEffect(() => {
    const priceMap: Record<string, number> = {};
    coins.forEach(coin => {
      priceMap[coin.id] = coin.currentPrice;
    });
    prevPricesRef.current = priceMap;
  }, [coins]);
  
  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
              <TableHead className="text-right">Circulating Supply</TableHead>
              <TableHead className="w-[100px]">Last 7d</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(10).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl overflow-hidden glass">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('rank')}>
                <div className="flex items-center">
                  <span>#</span>
                  {getSortIcon('rank')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  <span>Name</span>
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end">
                  <span>Price</span>
                  {getSortIcon('price')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('priceChange')}>
                <div className="flex items-center justify-end">
                  <span>24h %</span>
                  {getSortIcon('priceChange')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                <div className="flex items-center justify-end">
                  <span>Market Cap</span>
                  {getSortIcon('marketCap')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('volume')}>
                <div className="flex items-center justify-end">
                  <span>Volume (24h)</span>
                  {getSortIcon('volume')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('supply')}>
                <div className="flex items-center justify-end">
                  <span>Circulating Supply</span>
                  {getSortIcon('supply')}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Last 7d</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCoins.map((coin) => {
              const priceChangeClass = priceChanges[coin.id] 
                ? priceChanges[coin.id] === 'up' 
                  ? 'bg-green-500/20 transition-colors duration-1000' 
                  : 'bg-red-500/20 transition-colors duration-1000'
                : '';
                
              const percentChangeClass = coin.priceChangePercentage24h >= 0 
                ? 'text-green-500' 
                : 'text-red-500';
                
              return (
                <TableRow 
                  key={coin.id} 
                  className="cursor-pointer hover:bg-white/5"
                  onClick={() => onSelectCoin(coin)}
                >
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(coin.id);
                      }}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          watchlist.includes(coin.id) 
                            ? 'fill-yellow-500 text-yellow-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  </TableCell>
                  <TableCell>{coin.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img 
                        src={coin.logo} 
                        alt={coin.name} 
                        className="w-7 h-7 rounded-full" 
                      />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${priceChangeClass}`}>
                    <PriceDisplay 
                      price={coin.currentPrice}
                      lastUpdated={coin.lastUpdated}
                    />
                  </TableCell>
                  <TableCell className={`text-right font-medium ${percentChangeClass}`}>
                    <div className="flex items-center justify-end">
                      {coin.priceChangePercentage24h >= 0 ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {formatPercentage(coin.priceChangePercentage24h)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(coin.marketCap, true)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(coin.volume24h, true)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      {formatNumber(coin.circulatingSupply)} {coin.symbol}
                      {coin.maxSupply && (
                        <div className="text-xs text-muted-foreground">
                          Max: {formatNumber(coin.maxSupply)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SparklineChart 
                      data={coin.sparkline} 
                      priceChange={coin.priceChangePercentage24h} 
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            
            {sortedCoins.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex flex-col items-center">
                    <p className="text-lg text-muted-foreground">No cryptocurrencies found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CryptoTable;
