
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./sidebar-context";

interface MarketHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filterOptions: {
    marketCap: string;
    tokenType: string;
    performance: string;
    priceRange: { min: number; max: number };
  };
  setFilterOptions: (options: any) => void;
}

const MarketHeader = ({ searchQuery, onSearch, filterOptions, setFilterOptions }: MarketHeaderProps) => {
  const { toggle, isOpen } = useSidebar();
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold">Market</h1>
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden glass" 
          onClick={toggle}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      <p className="text-muted-foreground text-lg">
        Real-time prices and trading data for 100+ cryptocurrencies
      </p>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or ticker..."
          className="pl-10 h-12 bg-secondary glass border-0"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default MarketHeader;
