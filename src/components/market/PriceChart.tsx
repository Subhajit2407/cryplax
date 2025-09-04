
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface PriceChartProps {
  coinId: string;
  timeFrame: '1h' | '24h' | '7d';
}

const PriceChart = ({ coinId, timeFrame }: PriceChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Convert timeframe to days for API
  const getDays = () => {
    switch(timeFrame) {
      case '1h': return 1;
      case '24h': return 1;
      case '7d': return 7;
      default: return 1;
    }
  };
  
  // Get interval for chart data
  const getInterval = () => {
    switch(timeFrame) {
      case '1h': return 'minute';
      case '24h': return 'hour';
      case '7d': return 'day';
      default: return 'hour';
    }
  };
  
  // Fetch historical data
  const { data, isLoading, error } = useQuery({
    queryKey: ['coinChart', coinId, timeFrame],
    queryFn: async () => {
      const days = getDays();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      
      return response.json();
    },
    enabled: !!coinId,
  });
  
  // Process data when it arrives
  useEffect(() => {
    if (data && data.prices) {
      const interval = getInterval();
      let filteredData = data.prices;
      
      // Filter based on timeframe
      if (timeFrame === '1h') {
        // For 1h, get last hour of data (usually ~60 data points)
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        filteredData = filteredData.filter((item: [number, number]) => item[0] >= oneHourAgo);
      } else if (timeFrame === '24h') {
        // For 24h, take ~24 data points (one per hour)
        const pointsPerDay = filteredData.length;
        filteredData = filteredData.filter((_: any, index: number) => 
          index % Math.floor(pointsPerDay / 24) === 0
        );
      }
      
      // Format the data for the chart
      const formattedData = filteredData.map((item: [number, number]) => ({
        time: new Date(item[0]).toLocaleString(),
        value: item[1],
        timestamp: item[0],
      }));
      
      setChartData(formattedData);
    }
  }, [data, timeFrame]);
  
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>Failed to load chart data. Please try again later.</p>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No chart data available</p>
      </div>
    );
  }
  
  return (
    <ChartContainer
      config={{
        price: {
          label: "Price",
          theme: {
            light: "#3366FF",
            dark: "#3366FF",
          },
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3366FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              if (timeFrame === '1h') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (timeFrame === '24h') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }
            }}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => formatCurrency(Number(value), false)}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border rounded-md p-2 shadow-md">
                    <p className="text-sm font-medium">
                      {formatCurrency(Number(payload[0].value))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payload[0].payload.timestamp).toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="price"
            stroke="#3366FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PriceChart;
