
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/market/sidebar-context";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import MarketHeader from "@/components/market/MarketHeader";
import CryptoTable from "@/components/market/CryptoTable";
import MarketSidebar from "@/components/market/MarketSidebar";
import CoinDetails from "@/components/market/CoinDetails";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { Coin } from "@/types/market";

const Market = () => {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    marketCap: "all",
    tokenType: "all",
    performance: "all",
    priceRange: { min: 0, max: 1000000 }
  });
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        setSearchQuery(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    []
  );

  // Fetch crypto data with React Query
  const { data: coins = [], isLoading, error } = useQuery({
    queryKey: ['cryptoData'],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      
      return data.map((coin: any) => ({
        id: coin.id,
        rank: coin.market_cap_rank,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        logo: coin.image,
        currentPrice: coin.current_price,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        circulatingSupply: coin.circulating_supply,
        maxSupply: coin.max_supply,
        sparkline: coin.sparkline_in_7d?.price || [],
        lastUpdated: new Date(coin.last_updated),
      }));
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Apply filters
  const filteredCoins = coins.filter(coin => {
    const matchesSearch = 
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMarketCap = filterOptions.marketCap === 'all' ||
      (filterOptions.marketCap === 'large' && coin.marketCap >= 10000000000) ||
      (filterOptions.marketCap === 'medium' && coin.marketCap >= 1000000000 && coin.marketCap < 10000000000) ||
      (filterOptions.marketCap === 'small' && coin.marketCap < 1000000000);

    const matchesPerformance = filterOptions.performance === 'all' ||
      (filterOptions.performance === 'gainers' && coin.priceChangePercentage24h > 0) ||
      (filterOptions.performance === 'losers' && coin.priceChangePercentage24h < 0);

    const matchesPriceRange = 
      coin.currentPrice >= filterOptions.priceRange.min &&
      coin.currentPrice <= filterOptions.priceRange.max;

    return matchesSearch && matchesMarketCap && matchesPerformance && matchesPriceRange;
  });

  // Toggle watchlist
  const toggleWatchlist = (coinId: string) => {
    setWatchlist(prev =>
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId) 
        : [...prev, coinId]
    );
  };

  // Get watchlist coins
  const watchlistCoins = coins.filter(coin => watchlist.includes(coin.id));

  // Handle coin selection
  const handleSelectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch cryptocurrency data. Please try again later.",
      variant: "destructive",
    });
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-black text-foreground">
        <Navigation />
        
        <div className="pt-32 md:pt-24 pb-12 px-4 md:px-8 container">
          <MarketHeader 
            searchQuery={searchQuery} 
            onSearch={debouncedSearch}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
          />
          
          <div className="flex flex-col md:flex-row gap-8 mt-8">
            <MarketSidebar 
              watchlistCoins={watchlistCoins} 
              onSelectCoin={handleSelectCoin}
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
            />
            
            <div className="w-full">
              <CryptoTable 
                coins={filteredCoins}
                isLoading={isLoading}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
                onSelectCoin={handleSelectCoin}
              />
            </div>
          </div>
        </div>
        
        {selectedCoin && (
          <CoinDetails 
            coin={selectedCoin} 
            onClose={() => setSelectedCoin(null)} 
            isWatchlisted={watchlist.includes(selectedCoin.id)}
            toggleWatchlist={toggleWatchlist}
          />
        )}
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Market;
