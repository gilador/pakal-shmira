import { Card, CardContent } from "@/components/elements/card";

export interface ShiftHoursProps {
  shiftStartTimes: string[];
  className?: string;
}

export function ShiftHours({
  shiftStartTimes,
  className = "",
}: ShiftHoursProps) {
  const hasValidShifts =
    shiftStartTimes.length > 0 && shiftStartTimes[0] !== "Invalid";

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Shift Hours:</span>
            <span
              className={`text-sm font-medium ${
                hasValidShifts ? "text-primary" : "text-red-500"
              }`}
            >
              {hasValidShifts ? `${shiftStartTimes.length} Shifts` : "Invalid"}
            </span>
          </div>

          {/* Main display */}
          {hasValidShifts ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {shiftStartTimes.map((time, index) => (
                <div
                  key={index}
                  className="px-4 py-2 border border-gray-300 bg-white text-primary rounded-md font-medium text-lg"
                >
                  {time}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="px-6 py-4 border border-red-300 bg-red-50 text-red-500 rounded-md text-center font-medium">
                No valid shifts
              </div>
            </div>
          )}

          {/* Error message for invalid configuration */}
          {!hasValidShifts && (
            <p className="text-sm text-red-500 text-center">
              Unable to calculate valid shift times with current parameters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
