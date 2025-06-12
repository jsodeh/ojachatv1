import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DeliveryLocationTriggerProps {
  onLocationSelected: (location: string) => void;
}

const DELIVERY_LOCATIONS = [
  "Home - 123 Main St, Apt 4B",
  "Office - 456 Business Ave, Suite 200",
  "Other - 789 Secondary Rd",
];

export default function DeliveryLocationTrigger({
  onLocationSelected,
}: DeliveryLocationTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>();

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            {selectedLocation || "Select delivery location"}
          </span>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Delivery Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              className="gap-2"
            >
              {DELIVERY_LOCATIONS.map((location) => (
                <div
                  key={location}
                  className="flex items-center space-x-3 bg-white p-4 rounded-xl border"
                >
                  <RadioGroupItem value={location} id={location} />
                  <label
                    htmlFor={location}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {location}
                  </label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="w-full"
            >
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 