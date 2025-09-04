import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Star, 
  ExternalLink, 
  Copy, 
  Twitter, 
  Github 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coin } from "@/types/market";
import { formatCurrency, formatNumber, formatPercentage, formatDate } from "@/lib/formatters";
import PriceChart from "./PriceChart";

interface CoinDetailsProps {
  coin: Coin;
  onClose: () => void;
  isWatchlisted: boolean;
  toggleWatchlist: (coinId: string) => void;
}

type TimeFrame = '1h' | '24h' | '7d';

const CoinDetails = ({ 
  coin, 
  onClose, 
  isWatchlisted, 
  toggleWatchlist 
}: CoinDetailsProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  
  // Handle copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here if needed
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full md:w-[600px] h-full bg-[#0A0A0A] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-sm z-10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={coin.logo} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{coin.name}</h2>
                <span className="text-sm bg-white/10 px-2 py-0.5 rounded">
                  {coin.symbol}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Rank #{coin.rank}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleWatchlist(coin.id)}
              className="hover:bg-white/5"
            >
              <Star 
                className={`h-5 w-5 ${
                  isWatchlisted ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                }`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Price Section */}
        <div className="p-6 bg-black/20">
          <div className="flex flex-col">
            <div className="text-3xl font-bold">
              {formatCurrency(coin.currentPrice)}
            </div>
            <div className={`flex items-center mt-1 ${
              coin.priceChangePercentage24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatPercentage(coin.priceChangePercentage24h)}
              <span className="text-sm text-muted-foreground ml-2">24h</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Last updated: {formatDate(coin.lastUpdated)} at {coin.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Price Chart</h3>
            <div className="flex bg-black/20 rounded-lg p-1">
              <Button
                variant={timeFrame === '1h' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-7 rounded-md"
                onClick={() => setTimeFrame('1h')}
              >
                1H
              </Button>
              <Button
                variant={timeFrame === '24h' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-7 rounded-md"
                onClick={() => setTimeFrame('24h')}
              >
                24H
              </Button>
              <Button
                variant={timeFrame === '7d' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-7 rounded-md"
                onClick={() => setTimeFrame('7d')}
              >
                7D
              </Button>
            </div>
          </div>
          
          <div className="glass rounded-lg p-4">
            <PriceChart coinId={coin.id} timeFrame={timeFrame} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="glass rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="font-medium mt-1">{formatCurrency(coin.marketCap, true)}</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Volume (24h)</div>
              <div className="font-medium mt-1">{formatCurrency(coin.volume24h, true)}</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Circulating Supply</div>
              <div className="font-medium mt-1">
                {formatNumber(coin.circulatingSupply)} {coin.symbol}
              </div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Max Supply</div>
              <div className="font-medium mt-1">
                {coin.maxSupply ? `${formatNumber(coin.maxSupply)} ${coin.symbol}` : 'Unlimited'}
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-2 bg-white/5" />
        
        {/* Additional Info Tabs */}
        <div className="p-6">
          <Tabs defaultValue="about">
            <TabsList className="w-full bg-black/20">
              <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
              <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
              <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="pt-4">
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Detailed information about {coin.name} will appear here.
                </p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Contract Address</h4>
                  <div className="flex items-center gap-2 bg-secondary p-2 rounded text-xs">
                    <span className="truncate">0x123...abc</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard("0x123...abc")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button className="button-gradient w-full mt-6">
                Trade Now
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>
            
            <TabsContent value="markets" className="pt-4">
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Exchange information and markets for {coin.name} will appear here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="pt-4">
              <div className="glass rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>Github</span>
                  </a>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CoinDetails;
