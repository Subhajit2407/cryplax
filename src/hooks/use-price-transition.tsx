
import { useState, useEffect, useRef } from "react";

interface PriceTransitionOptions {
  duration?: number;
  decimals?: number;
}

export function usePriceTransition(
  currentPrice: number,
  { duration = 1000, decimals = 2 }: PriceTransitionOptions = {}
) {
  const [displayPrice, setDisplayPrice] = useState(currentPrice);
  const [trend, setTrend] = useState<"up" | "down" | null>(null);
  const previousPrice = useRef(currentPrice);

  useEffect(() => {
    if (currentPrice !== previousPrice.current) {
      setTrend(currentPrice > previousPrice.current ? "up" : "down");
      setDisplayPrice(currentPrice);

      const timer = setTimeout(() => {
        setTrend(null);
      }, duration);

      previousPrice.current = currentPrice;
      return () => clearTimeout(timer);
    }
  }, [currentPrice, duration]);

  return {
    displayPrice: displayPrice.toFixed(decimals),
    trend,
  };
}
