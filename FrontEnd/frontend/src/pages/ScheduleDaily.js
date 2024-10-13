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

  // Step 1: Track each tutor's schedule layout
  const tutorSchedule = {};

  // Initialize the schedule map
  resources.forEach(tutor => {
    tutorSchedule[tutor.id] = timeSlots.map(() => []);
  });

  // Populate the schedule map
  events.forEach(event => {
    const tutorId = event.resource;
    const startTime = new Intl.DateTimeFormat('en-US', timeonlySetting).format(event.start);
    const endTime = new Intl.DateTimeFormat('en-US', timeonlySetting).format(event.end);

    // Get start and end indices
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);

    // Track columns by marking occupancy
    for (let i = startIndex; i < endIndex; i++) {
      tutorSchedule[tutorId][i].push(event);
    }
  });

  return (
    <div className="calendar">
      <h1>Schedule for {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {resources.map(tutor => (
              <th key={tutor.id} className="tutor-header" colSpan={tutorSchedule[tutor.id].reduce((max, col) => Math.max(max, col.length), 1)}>
                {tutor.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={time}>
              <td className="time-cell">{time}</td>
              {resources.map(tutor => {
                const sessions = tutorSchedule[tutor.id][timeIndex];

                if (sessions.length) {
                  return (
                    sessions.map((session, index) => {
                      const rowSpan = calculateRowSpan(session.start, session.end);
                      return (
                        <td key={`${session.id}-${index}`} rowSpan={rowSpan} className="session-cell">
                          <div className="session">{session.student}</div>
                        </td>
                      );
                    })
                  );
                }

                // Return a placeholder for empty slots
                return <td key={`${tutor.id}-${timeIndex}`} className="no-session">No Sessions</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDaily;
