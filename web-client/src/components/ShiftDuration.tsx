interface ShiftDurationProps {
  startTime: string;
  endTime: string;
  className?: string;
}

export function ShiftDuration({
  startTime,
  endTime,
  className = "",
}: ShiftDurationProps) {
  // Parse time strings to extract hours and minutes
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return { hours, minutes };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  return (
    <div className={`flex items-baseline justify-center gap-[0.2rem] ${className}`}>
      {/* Start Time - Large with superscript minutes */}
      <div className="flex items-start">
        <span style={{ fontSize: '1.2rem', fontWeight: 400, lineHeight: 1 }}>
          {start.hours}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 400, lineHeight: 1 }} className="text-gray-600">
          {start.minutes}
        </span>
      </div>

      {/* Arrow */}
      <svg
        width="16"
        height="10"
        viewBox="0 0 21 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        style={{ marginLeft: '-1rem', transform: 'translateY(3px) translateX(1px)' }}
      >
        <path
          d="M20.3536 4.35355C20.5488 4.15829 20.5488 3.84171 20.3536 3.64645L17.1716 0.464466C16.9763 0.269204 16.6597 0.269204 16.4645 0.464466C16.2692 0.659728 16.2692 0.976311 16.4645 1.17157L19.2929 4L16.4645 6.82843C16.2692 7.02369 16.2692 7.34027 16.4645 7.53553C16.6597 7.7308 16.9763 7.7308 17.1716 7.53553L20.3536 4.35355ZM0 4.5H20V3.5H0V4.5Z"
          fill="black"
        />
      </svg>

      {/* End Time - Medium with superscript minutes */}
      <div className="flex items-start">
        <span style={{ fontSize: '0.8rem', fontWeight: 400, lineHeight: 1 }}>
          {end.hours}
        </span>
        <span style={{ fontSize: '0.45rem', fontWeight: 400, lineHeight: 1 }} className="text-gray-600">
          {end.minutes}
        </span>
      </div>
    </div>
  );
}
