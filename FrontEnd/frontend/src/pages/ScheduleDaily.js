import React from 'react';
import { useParams } from 'react-router-dom';
import { DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import "./css/Calendar.css";

const fetchHomework = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homework');
  }
  return response.json();
};

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};

const fetchTutors = async() => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch comments');
    err.status = response.status;
    throw err;
  }

  console.log("successfully fetched comments");
  return response.json();
}

const fetchTutoringSessions = async() => {
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

  console.log("successfully fetched tutoring sessions");
  return response.json();
}

const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  }
};

const ScheduleDaily = () => {
  const { date } = useParams();

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({ queryKey: ['tutors'], queryFn: fetchTutors });

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionLoading,
    error: tutoringSessionError,
  } = useQuery({ queryKey: ['tutoringSessions'], queryFn: fetchTutoringSessions });

  if (tutorsLoading || tutoringSessionLoading) return <div>Loading...</div>;
  if (tutoringSessionError || tutorsError) {
    if (tutoringSessionError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  // Prepare the resources (tutors) for the scheduler
  const resources = tutors.slice(0, 5).map(tutor => ({
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`
  }));

  // Prepare the events for the scheduler
  const events = tutoringSessionData
    .map(session => ({
      id: session.session_id,
      resource: session.tutor_id, // Map to the corresponding tutor
      text: session.student_id || 'Unnamed Student',
      start: new Date(session.session_datetime),
      end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
    }));

  return (
    <div className="App">
      <DayPilotScheduler
        resources={resources}
        events={events}
        startDate={date ? new Date(date) : new Date()} // Set the start date
        viewType="Day" // Change to "Day" to show only one day
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
