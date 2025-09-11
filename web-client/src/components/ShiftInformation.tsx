import { Card, CardContent } from "@/components/elements/card";

export interface ShiftInformationProps {
  shiftDuration: number;
  restTime: number;
  className?: string;
}

export function ShiftInformation({
  shiftDuration,
  restTime,
  className = "",
}: ShiftInformationProps) {
  const formatTime = (hours: number) => {
    if (hours === 0) return "0.00h";
    return `${hours.toFixed(2)}h`;
  };

  const isValidDuration = shiftDuration > 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">
              Shift Information:
            </span>
            <span
              className={`text-sm font-medium ${
                isValidDuration ? "text-primary" : "text-red-500"
              }`}
            >
              {isValidDuration ? "Configured" : "Invalid"}
            </span>
          </div>

          {/* Responsive display - horizontal first, vertical on smaller screens */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Rest Time */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rest Time
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-center font-medium text-gray-700">
                {formatTime(restTime)}
              </div>
            </div>

            {/* Visual separator pointing from rest time to duration */}
            <div className="hidden sm:flex items-end pb-2">
              <span className="text-gray-400 font-medium">→</span>
            </div>

            {/* Duration */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration
              </label>
              <div className="relative">
                <div
                  className={`w-full px-3 py-2 border rounded-md text-center font-medium ${
                    isValidDuration
                      ? "border-gray-300 bg-white text-primary"
                      : "border-red-300 bg-red-50 text-red-500"
                  }`}
                >
                  {formatTime(shiftDuration)}
                </div>
              </div>
            </div>
          </div>

          {/* Error message for invalid configuration */}
          {!isValidDuration && (
            <p className="text-sm text-red-500 text-center">
              Unable to calculate valid shift duration with current parameters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
