import React from 'react';

interface Props {
  date: string;
  startTime: string;
  endTime: string;
  onChange: (date: string, startTime: string, endTime: string) => void;
}

const DateTimeSelector: React.FC<Props> = ({ date, startTime, endTime, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Tarih</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value, startTime, endTime)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Başlangıç Saati</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => onChange(date, e.target.value, endTime)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Bitiş Saati</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => onChange(date, startTime, e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
    </div>
  );
};

export default DateTimeSelector;
