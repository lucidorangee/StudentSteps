import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { useQuery } from '@tanstack/react-query';
import "./css/Calendar.css";

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
      'Content-Type': 'application/json',
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

  // Data fetching with react-query
  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery(['tutors'], fetchTutors);

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionLoading,
    error: tutoringSessionError,
  } = useQuery(['tutoringSessions'], fetchTutoringSessions);

  // Loading state
  if (tutorsLoading || tutoringSessionLoading) return <div>Loading...</div>;

  // Error handling
  if (tutoringSessionError || tutorsError) {
    if (tutoringSessionError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionError?.message || tutorsError?.message}</div>;
  }

  // Prepare resources for the scheduler
  const resources = tutors.slice(0, 5).map(tutor => ({
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`
  }));

  // Prepare events for the scheduler
  const events = tutoringSessionData.map(session => ({
    id: session.session_id,
    resource: session.tutor_id, // Map to the corresponding tutor
    text: session.student_name || 'Unnamed Student', // Use session.student_name if available
    start: new Date(session.session_datetime),
    end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
  }));

  return (
    <div className="App">
      <DayPilotScheduler
        resources={resources}
        events={events}
        startDate={date ? new Date(date) : new Date()} // Set the start date
        viewType="Day" // Show only one day
        timeHeaders={[
          { groupBy: "Month", format: "MMMM" },
          { groupBy: "Day", format: "dd" }
        ]}
        style={{ height: '600px' }} // Adjust height as needed
      />
    </div>
  );
};

export default ScheduleDaily;
