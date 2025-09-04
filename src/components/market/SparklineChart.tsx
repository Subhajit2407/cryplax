
import { useEffect, useRef } from "react";

interface SparklineChartProps {
  data: number[];
  priceChange: number;
  height?: number;
}

const SparklineChart = ({ data, priceChange, height = 40 }: SparklineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine line color based on price change
    const lineColor = priceChange >= 0 ? "#4ADE80" : "#F43F5E";
    
    // Calculate min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate points
    const points = data.map((price, index) => ({
      x: (index / (data.length - 1)) * canvas.width,
      y: canvas.height - ((price - min) / range) * (canvas.height * 0.8) - (canvas.height * 0.1)
    }));
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Fill area under the line
    ctx.lineTo(points[points.length - 1].x, canvas.height);
    ctx.lineTo(points[0].x, canvas.height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `${lineColor}33`);
    gradient.addColorStop(1, `${lineColor}00`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [data, priceChange]);
  
  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={height}
        className="w-full h-full"
      />
    </div>
  );
};

export default SparklineChart;
