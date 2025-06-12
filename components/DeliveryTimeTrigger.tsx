import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import DeliveryTimeSelector from './DeliveryTimeSelector';

interface DeliveryTimeTriggerProps {
  onTimeSelected: (date: Date, timeSlot: string) => void;
  location?: string;
}

const DeliveryTimeTrigger: React.FC<DeliveryTimeTriggerProps> = ({ 
  onTimeSelected,
  location 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; timeSlot: string } | null>(null);

  const handleTimeSelection = (date: Date, timeSlot: string) => {
    setSelectedDateTime({ date, timeSlot });
    onTimeSelected(date, timeSlot);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            {selectedDateTime
              ? `${selectedDateTime.date.toLocaleDateString()} at ${selectedDateTime.timeSlot}`
              : 'Select delivery time'}
          </span>
        </div>
      </button>

      <DeliveryTimeSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTime={handleTimeSelection}
        location={location}
      />
    </>
  );
};

export default DeliveryTimeTrigger; 