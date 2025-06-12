import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock } from "lucide-react";

interface DeliveryTimeTriggerProps {
  onTimeSelected: (date: Date, timeSlot: string) => void;
  location?: string;
}

const TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
];

export default function DeliveryTimeTrigger({
  onTimeSelected,
  location,
}: DeliveryTimeTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Date;
    timeSlot: string;
  }>();

  const handleConfirm = () => {
    if (date && selectedTimeSlot) {
      setSelectedDateTime({ date, timeSlot: selectedTimeSlot });
      onTimeSelected(date, selectedTimeSlot);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!location}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            {selectedDateTime
              ? `${format(selectedDateTime.date, "MMM d")} - ${
                  selectedDateTime.timeSlot
                }`
              : location
              ? "Select delivery time"
              : "Please select location first"}
          </span>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-[425px] flex flex-col h-[85vh] p-0">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle className="text-xl font-semibold text-gray-900">Select Delivery Time</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-4">
            <div className="py-4 space-y-6">
              <div className="bg-white rounded-lg">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Available Time Slots</h3>
                <RadioGroup
                  value={selectedTimeSlot}
                  onValueChange={setSelectedTimeSlot}
                  className="space-y-2"
                >
                  {TIME_SLOTS.map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-3 bg-white p-3 rounded-xl border hover:bg-gray-50"
                    >
                      <RadioGroupItem value={slot} id={slot} />
                      <label
                        htmlFor={slot}
                        className="flex-1 text-sm font-medium cursor-pointer text-gray-700"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t p-4 bg-white">
            <Button
              onClick={handleConfirm}
              disabled={!date || !selectedTimeSlot}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm Time
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 