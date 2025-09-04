
/**
 * Format currency values with appropriate abbreviations
 */
export const formatCurrency = (value: number, compact = false): string => {
  if (value === null || value === undefined) return "N/A";
  
  if (compact) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)} B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)} M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)} K`;
    }
  }
  
  // Handle very small numbers (common in crypto)
  if (value < 0.01 && value > 0) {
    return `$${value.toFixed(6)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

/**
 * Format percentages with appropriate sign and decimals
 */
export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined) return "N/A";
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format large numbers with appropriate abbreviations
 */
export const formatNumber = (value: number | null): string => {
  if (value === null || value === undefined) return "N/A";
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)} K`;
  }
  
  return value.toLocaleString();
};

/**
 * Format date to locale string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time to locale string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};
