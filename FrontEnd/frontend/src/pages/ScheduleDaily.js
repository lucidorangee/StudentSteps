import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import "./css/Calendar.css";

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch tutors');
  return response.json();
};

const fetchTutoringSessions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch tutoring sessions');
  return response.json();
};

const WeeklyCalendar = () => {
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

  const eventsByTutor = (tutorId) => {
    return tutoringSessionData
      .filter(session => session.tutor_id === tutorId)
      .map(session => ({
        id: session.session_id,
        text: session.student_name || 'Unnamed Student', // Assuming session has a student_name property
        start: new Date(session.session_datetime),
        end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
      }));
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {tutors.slice(0, 5).map(tutor => (
          <div key={tutor.tutor_id} style={{ flex: 1, margin: '10px' }}>
            <h4>{`${tutor.first_name} ${tutor.last_name}`}</h4>
            <DayPilotCalendar
              viewType="Day" // Change to "Day" to show only one day
              events={eventsByTutor(tutor.tutor_id)}
              startDate={date ? new Date(date) : new Date()}
              style={{ height: '400px' }} // Adjust height as needed
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
