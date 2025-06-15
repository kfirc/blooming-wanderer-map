import React from 'react';

interface SidebarInfoModeProps {
  title?: string;
  content?: string;
}

export const SidebarInfoMode: React.FC<SidebarInfoModeProps> = ({ 
  title = 'מידע על הדף',
  content = 'כאן יוצג מידע על הדף, מטרותיו, והסבר קצר על השימוש במפה ובדיווחי הפריחה.'
}) => {
  return (
    <div className="p-8 text-center text-gray-700">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p>{content}</p>
    </div>
  );
}; 