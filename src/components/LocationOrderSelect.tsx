import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface LocationOrderSelectProps {
  value: 'date' | 'likes';
  onChange: (value: 'date' | 'likes') => void;
  selectClassName?: string;
}

const LocationOrderSelect: React.FC<LocationOrderSelectProps> = ({ value, onChange, selectClassName }) => {
  return (
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={v => onChange(v as 'date' | 'likes')}>
        <SelectTrigger className={selectClassName || "border rounded px-2 py-1 text-sm min-w-[80px]"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">תאריך</SelectItem>
          <SelectItem value="likes">לייקים</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationOrderSelect; 