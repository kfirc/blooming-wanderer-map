import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface FlowerOption {
  id: string;
  name: string;
}

interface LocationFlowerFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: FlowerOption[];
  className?: string;
}

const LocationFlowerFilter: React.FC<LocationFlowerFilterProps> = ({ value, onChange, options, className }) => {
  return (
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className || "border rounded px-2 py-1 text-sm min-w-[80px]"}>
          <SelectValue placeholder="הכל" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">הכל</SelectItem>
          {options.map(option => (
            <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFlowerFilter; 