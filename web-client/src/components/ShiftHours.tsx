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
      <CardContent className="p-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 text-sm">
              Shift Hours:
            </span>
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
            <div className="flex flex-wrap gap-1 justify-center">
              {shiftStartTimes.map((time, index) => (
                <div
                  key={index}
                  className="px-2 py-1 border border-gray-300 bg-white text-primary rounded-md font-medium text-sm"
                >
                  {time}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="px-3 py-2 border border-red-300 bg-red-50 text-red-500 rounded-md text-center font-medium text-sm">
                No valid shifts
              </div>
            </div>
          )}

          {/* Error message for invalid configuration */}
          {!hasValidShifts && (
            <p className="text-xs text-red-500 text-center">
              Unable to calculate valid shift times with current parameters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
