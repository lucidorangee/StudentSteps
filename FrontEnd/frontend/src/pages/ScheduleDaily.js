import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './css/DailyCalendar.css'; // Ensure your CSS is linked here

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
  console.log(date);

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({ queryKey: ['tutors'], queryFn: () => fetchTutors() });

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({ queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions() });

  if (tutorsLoading || tutoringSessionsLoading) return <div>Loading...</div>;

  if (tutoringSessionsError || tutorsError) {
    if (tutoringSessionsError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message || tutorsError?.message}</div>;
  }

  const resources = tutors.map(tutor => ({
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`
  }));

  const events = tutoringSessionData.map(session => ({
    id: session.session_id,
    resource: session.tutor_id,
    student: session.student_name || 'Unnamed Student',
    start: new Date(session.session_datetime),
    end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
  }));

  // Define time slots
  const timeSlots = [];
  const startHour = 15;
  const endHour = 20;
  for (let hour = startHour; hour <= endHour; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  const calculateRowSpan = (start, end) => {
    return Math.ceil((end - start) / (30 * 60 * 1000));
  };

  const activeCells = {};

  // Debugging logs
  console.log(`Today's date is ${new Date(date)} from ${date}`);
  console.log('Events:', events);
  console.log('Time Slots:', timeSlots);

  return (
    <div className="calendar">
      <h1>Schedule for {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {resources.map(tutor => (
              <th key={tutor.id} className="tutor-header">{tutor.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={time}>
              <td className="time-cell">{time}</td>
              {resources.map(tutor => {
                const session = events.find(event => {
                  const eventStartTime = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return event.resource === tutor.id && eventStartTime === time;
                });

                if (session) {
                  const rowSpan = calculateRowSpan(session.start, session.end);
                  activeCells[`${tutor.id}-${timeIndex}`] = true;

                  return (
                    <td key={tutor.id} className="session-cell" rowSpan={rowSpan}>
                      <div className="session">
                        {session.student}
                      </div>
                    </td>
                  );
                }

                if (activeCells[`${tutor.id}-${timeIndex}`]) {
                  return null;
                }

                return <td key={tutor.id} className="no-session">No Sessions</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDaily;