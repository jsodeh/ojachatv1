import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, X, Loader2 } from 'lucide-react';
import { useDeliveryTimes } from '../hooks/useDeliveryTimes';

interface DeliveryTimeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (date: Date, timeSlot: string) => void;
  location?: string;
}

const DeliveryTimeSelector: React.FC<DeliveryTimeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTime,
  location
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { deliveryTimes, loading, error } = useDeliveryTimes(location);
  
  // Generate week days starting from current week
  const startDate = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  // Get available time slots for selected date
  const getTimeSlots = (date: Date) => {
    if (!deliveryTimes.length) return [];
    
    const schedule = deliveryTimes.find(s => location ? s.location === location : true);
    if (!schedule) return [];

    return schedule.available_times
      .filter(time => isSameDay(time, date))
      .map(time => format(time, 'h:mm a'));
  };

  const timeSlots = getTimeSlots(selectedDate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">What time works best for delivery?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="text-red-600 mb-4">
            Error loading delivery times: {error}
          </div>
        )}

        {/* Date selector */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button className="p-2 hover:bg-gray-200 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-7 gap-2 flex-1 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
              {weekDays.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-lg py-2 text-center ${
                    format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-200'
                  } ${getTimeSlots(date).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={getTimeSlots(date).length === 0}
                >
                  <div className="text-lg">{format(date, 'd')}</div>
                  <div className="text-xs">{format(date, 'MMM')}</div>
                </button>
              ))}
            </div>
            <button className="p-2 hover:bg-gray-200 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Time slot selector */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>30 min delivery window</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((timeSlot) => (
                <button
                  key={timeSlot}
                  onClick={() => onSelectTime(selectedDate, timeSlot)}
                  className="py-3 px-4 rounded-lg border border-gray-200 hover:border-purple-600 hover:bg-purple-50 text-center"
                >
                  {timeSlot}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No delivery times available for this date
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Powered by Lantern
        </div>
      </div>
    </div>
  );
};

export default DeliveryTimeSelector; 