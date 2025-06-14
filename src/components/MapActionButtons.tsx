
import React from 'react';
import MapAuthButton from './MapAuthButton';

const MapActionButtons: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col space-y-3">
      <MapAuthButton />
    </div>
  );
};

export default MapActionButtons;
