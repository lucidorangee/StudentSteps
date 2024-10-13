import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './css/DailyCalendar.css';

// Fetch functions
const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutors');
    err.status = response.status;
    throw err;
  }

  return response.json();
};

const fetchTutoringSessions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutoring sessions');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const ScheduleDaily = () => {
  const { date } = useParams();

  const timeonlySetting = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York',
    hour12: false,
  };

  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery({ queryKey: ['tutors'], queryFn: fetchTutors });
  const { data: tutoringSessionData, isLoading: tutoringSessionsLoading, error: tutoringSessionsError } = useQuery({ queryKey: ['tutoringSessions'], queryFn: fetchTutoringSessions });

  if (tutorsLoading || tutoringSessionsLoading) return <div>Loading...</div>;

  if (tutoringSessionsError || tutorsError) {
    if (tutoringSessionsError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message || tutorsError?.message}</div>;
  }

  const resources = tutors.map(tutor => ({
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`,
  }));

  const events = tutoringSessionData.map(session => ({
    id: session.session_id,
    resource: session.tutor_id,
    student: session.student_name || 'Unnamed Student',
    start: new Date(session.session_datetime),
    end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
  }));

  const timeSlots = [];
  for (let hour = 15; hour <= 20; hour++) {
    timeSlots.push(`${hour}:00`, `${hour}:30`);
  }

  const calculateRowSpan = (start, end) => Math.ceil((end - start) / (30 * 60 * 1000));

  // Step 1: Determine max overlap per tutor
  const maxColumnsPerTutor = {};
  resources.forEach(tutor => {
    const tutorEvents = events.filter(event => event.resource === tutor.id);
    for (const [event, data] of Object.entries(tutorEvents)) {
      console.log(`Event: ${event}, Columns: ${data}`);
    }
    const overlaps = [];

    tutorEvents.forEach((event, i) => {
      const count = tutorEvents.filter(
        otherEvent => otherEvent.start < event.end && otherEvent.end > event.start
      ).length;
      overlaps.push(count);
    });

    maxColumnsPerTutor[tutor.id] = Math.max(...overlaps, 1); // Ensure at least 1 column
  });

  for (const [tutor, columns] of Object.entries(maxColumnsPerTutor)) {
    console.log(`Tutor: ${tutor}, Columns: ${columns}`);
  }

  return (
    <div className="calendar">
      <h1>Schedule for {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {resources.map(tutor =>
              Array.from({ length: maxColumnsPerTutor[tutor.id] }).map((_, colIndex) => (
                <th key={`${tutor.id}-${colIndex}`} className="tutor-header">
                  {tutor.name} {colIndex > 0 ? `(${colIndex + 1})` : ''}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={time}>
              <td className="time-cell">{time}</td>
              {resources.map(tutor => {
                const columns = Array.from({ length: maxColumnsPerTutor[tutor.id] });
                return columns.map((_, colIndex) => {
                  const session = events.find(event => {
                    const eventStartTime = new Intl.DateTimeFormat('en-US', timeonlySetting).format(event.start);
                    return (
                      event.resource === tutor.id &&
                      eventStartTime === time &&
                      event.start.getHours() === parseInt(time.split(':')[0], 10) &&
                      colIndex === 0 // Starting in the first available column
                    );
                  });

                  if (session) {
                    const rowSpan = calculateRowSpan(session.start, session.end);
                    return (
                      <td key={`${tutor.id}-${colIndex}-${timeIndex}`} className="session-cell" rowSpan={rowSpan}>
                        <div className="session">{session.student}</div>
                      </td>
                    );
                  }
                  return <td key={`${tutor.id}-${colIndex}-${timeIndex}`} className="no-session">No Sessions</td>;
                });
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDaily;
