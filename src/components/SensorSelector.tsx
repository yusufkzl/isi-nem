import React from 'react';

interface Props {
  selected: 1 | 2 | null;
  onChange: (sensor: 1 | 2 | null) => void;
}

const SensorSelector: React.FC<Props> = ({ selected, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val === 'all' ? null : Number(val) as 1 | 2);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">Sensör Seçimi</label>
      <select
        value={selected === null ? 'all' : selected}
        onChange={handleChange}
        className="border rounded px-3 py-2 shadow-sm"
      >
        <option value="all">Tümü</option>
        <option value={1}>Sensör 1</option>
        <option value={2}>Sensör 2</option>
      </select>
    </div>
  );
};

export default SensorSelector;
