import { HourlyForecast } from '@/types/weather';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

interface HourlyChartProps {
  hourlyData: HourlyForecast[];
}

const HourlyChart = ({ hourlyData }: HourlyChartProps) => {
  const chartData = hourlyData.map(item => ({
    time: item.time.toLocaleTimeString('en-US', { hour: 'numeric' }),
    temp: item.temperature,
    pop: item.pop,
    description: item.description,
    condition: item.condition,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-semibold text-foreground">{data.time}</p>
          <p className="text-primary">{data.temp}°C</p>
          <p className="text-muted-foreground capitalize">{data.description}</p>
          {data.pop > 0 && (
            <p className="text-primary/70 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> {data.pop}% rain
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Next 24 Hours</h3>
      </div>

      {/* Hourly Icons Row */}
      <div className="flex justify-between mb-4 overflow-x-auto pb-2">
        {hourlyData.map((hour, index) => (
          <div key={index} className="flex flex-col items-center min-w-[60px]">
            <span className="text-xs text-muted-foreground">
              {hour.time.toLocaleTimeString('en-US', { hour: 'numeric' })}
            </span>
            <WeatherIcon condition={hour.condition} size={24} />
            <span className="text-sm font-medium text-foreground">{hour.temperature}°</span>
          </div>
        ))}
      </div>

      {/* Temperature Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
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
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              fill="url(#tempGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;
