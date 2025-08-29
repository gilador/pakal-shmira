import { Card, CardContent } from "@/components/ui/card";

export interface ShiftInfoViewProps {
  restTime: number;
  startHour: string;
  endHour: string;
  className?: string;
}

export function ShiftInfoView({
  restTime,
  startHour,
  endHour,
  className = "",
}: ShiftInfoViewProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 ${className}`}>
      <h4 className="text-lg font-semibold text-center">Shift Information</h4>

      <div className="flex flex-col gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Start Time:</span>
              <span className="text-lg font-semibold">{startHour}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">End Time:</span>
              <span className="text-lg font-semibold">{endHour}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Minimum Rest Time:
              </span>
              <span className="text-lg font-semibold">{restTime} hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
