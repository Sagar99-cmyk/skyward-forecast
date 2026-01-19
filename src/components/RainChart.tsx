import { HourlyForecast } from '@/types/weather';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CloudRain } from 'lucide-react';

interface RainChartProps {
  hourlyData: HourlyForecast[];
}

const RainChart = ({ hourlyData }: RainChartProps) => {
  const chartData = hourlyData.map(item => ({
    time: item.time.toLocaleTimeString('en-US', { hour: 'numeric' }),
    pop: item.pop,
    description: item.description,
  }));

  const hasRainData = chartData.some(d => d.pop > 0);

  if (!hasRainData) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-semibold text-foreground">{data.time}</p>
          <p className="text-primary">{data.pop}% chance of rain</p>
          <p className="text-muted-foreground capitalize">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <CloudRain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Rain Probability</h3>
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="pop"
              fill="url(#rainGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainChart;
