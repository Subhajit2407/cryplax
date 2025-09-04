import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronLeft, 
  Star, 
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Coin } from "@/types/market";
import { useSidebar } from "./sidebar-context";
import { FilterOptions } from "@/types/market";

interface MarketSidebarProps {
  watchlistCoins: Coin[];
  onSelectCoin: (coin: Coin) => void;
  filterOptions: {
    marketCap: string;
    tokenType: string;
    performance: string;
    priceRange: { min: number; max: number };
  };
  setFilterOptions: (options: any) => void;
}

const MarketSidebar = ({ watchlistCoins, onSelectCoin, filterOptions, setFilterOptions }: MarketSidebarProps) => {
  const { isOpen, toggle } = useSidebar();
  const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(true);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  
  const updateFilterOption = (key: string, value: string) => {
    setFilterOptions({
      ...filterOptions,
      [key]: value
    });
  };
  
  return (
    <div 
      className={`
        fixed md:sticky top-20 left-0 h-[calc(100vh-80px)] md:h-auto 
        bg-[#0A0A0A] md:bg-transparent backdrop-blur-xl md:backdrop-filter-none
        z-20 transition-all duration-300 border-r border-white/5 md:border-none
        ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0 md:w-[280px] md:translate-x-0'}
      `}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle}
            className="md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Watchlist Section */}
        <div className="mb-6">
          <button 
            className="flex items-center justify-between w-full text-left mb-2"
            onClick={() => setIsWatchlistExpanded(!isWatchlistExpanded)}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span className="font-medium">Watchlist</span>
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isWatchlistExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isWatchlistExpanded && (
            <div className="space-y-2 py-2">
              {watchlistCoins.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2">
                  Add coins to your watchlist by clicking the star icon.
                </p>
              ) : (
                watchlistCoins.map(coin => (
                  <button
                    key={coin.id}
                    className="flex items-center justify-between w-full p-2 text-sm hover:bg-white/5 rounded-md transition-colors"
                    onClick={() => onSelectCoin(coin)}
                  >
                    <div className="flex items-center">
                      <img 
                        src={coin.logo} 
                        alt={coin.name} 
                        className="w-5 h-5 mr-2"
                      />
                      <span>{coin.name}</span>
                    </div>
                    <div className={`
                      text-sm font-medium
                      ${coin.priceChangePercentage24h >= 0 ? 'text-green-500' : 'text-red-500'}
                    `}>
                      {coin.priceChangePercentage24h >= 0 ? '+' : ''}
                      {coin.priceChangePercentage24h.toFixed(2)}%
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <Separator className="my-4 bg-white/10" />
        
        {/* Filter Section */}
        <div>
          <button 
            className="flex items-center justify-between w-full text-left mb-4"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <div className="flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span className="font-medium">Filter Options</span>
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isFiltersExpanded && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Market Cap</label>
                <Select 
                  value={filterOptions.marketCap}
                  onValueChange={(value) => updateFilterOption('marketCap', value)}
                >
                  <SelectTrigger className="bg-secondary glass border-0">
                    <SelectValue placeholder="All Market Caps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Market Caps</SelectItem>
                    <SelectItem value="large">Large Cap (&gt;$10B)</SelectItem>
                    <SelectItem value="medium">Medium Cap ($1B-$10B)</SelectItem>
                    <SelectItem value="small">Small Cap (&lt;$1B)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Token Type</label>
                <Select
                  value={filterOptions.tokenType}
                  onValueChange={(value) => updateFilterOption('tokenType', value)}
                >
                  <SelectTrigger className="bg-secondary glass border-0">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="erc20">ERC-20</SelectItem>
                    <SelectItem value="bep20">BEP-20</SelectItem>
                    <SelectItem value="native">Native Coin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Performance</label>
                <Select
                  value={filterOptions.performance}
                  onValueChange={(value) => updateFilterOption('performance', value)}
                >
                  <SelectTrigger className="bg-secondary glass border-0">
                    <SelectValue placeholder="All Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="gainers">Top Gainers</SelectItem>
                    <SelectItem value="losers">Top Losers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full glass-hover"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketSidebar;
