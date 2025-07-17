import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorReading } from '../services/mockData';

interface Props {
  title: string;
  data: SensorReading[];
}

const SensorHistoryChart: React.FC<Props> = ({ title, data }) => {
  return (
    <div className="p-4 bg-white rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
  <LineChart
    data={data}
    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
  >
    <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
    <XAxis
      dataKey="hour"
      interval={0}
      angle={-45}
      textAnchor="end"
    />
    <YAxis />
    <Tooltip />
    <Legend verticalAlign="top" />
    <Line
      type="monotone"
      dataKey="temperature"
      stroke="#ff7300"
      name="Sıcaklık (°C)"
      strokeWidth={2}
      dot={{ r: 3 }}
      activeDot={{ r: 5 }}
    />
    <Line
      type="monotone"
      dataKey="humidity"
      stroke="#387908"
      name="Nem (%)"
      strokeWidth={2}
      dot={{ r: 3 }}
      activeDot={{ r: 5 }}
    />
  </LineChart>
</ResponsiveContainer>

    </div>
  );
};

export default SensorHistoryChart;
