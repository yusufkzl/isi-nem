import React, { useEffect, useState } from 'react';

const AlarmStatus: React.FC = () => {
  const [isAlarm, setIsAlarm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAlarmStatus = async () => {
      try {
        const response = await fetch('/api/evant/checkAlarm');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const alarmStatus = await response.json();
        setIsAlarm(alarmStatus);
      } catch (err) {
        setError('Failed to check alarm status');
      }
    };

    checkAlarmStatus();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Alarm Status</h2>
      {isAlarm ? (
        <div>
          <p>Alarm is active! Check the sensor details for more information.</p>
          {/* Add more details or actions here */}
        </div>
      ) : (
        <p>No active alarms.</p>
      )}
    </div>
  );
};

export default AlarmStatus; 