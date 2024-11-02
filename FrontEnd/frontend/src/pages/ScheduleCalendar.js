import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Select from 'react-select';
import './css/custom-calendar.css'; // Import custom calendar CSS
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';

const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutors');
    err.status = response.status;
    throw err;
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
    const err = new Error('Failed to fetch students');
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
}

const fetchAssessments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assessments`, {
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
}
const CalendarPage = ({ defaultStudentId = -1 }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [filteredTutoringSessions, setFilteredTutoringSessions] = useState([]);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  useEffect(() => {
    const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);
    setDays([...Array(startDay).fill(""), ...daysInMonth]);
  }, [currentMonth, startDay, endOfMonth]);

  const getEventsForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const assessments = filteredAssessments.filter((a) => new Date(a.date).toISOString().split("T")[0] === formattedDate);
    const tutoringSessions = filteredTutoringSessions.filter((s) => new Date(s.session_datetime).toISOString().split("T")[0] === formattedDate);

    return [...assessments, ...tutoringSessions];
  };

  return (
    <div className="container-fluid calendar-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handlePrevMonth}>Previous Month</button>
        <h2>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
        <button className="btn btn-primary" onClick={handleNextMonth}>Next Month</button>
      </div>
      
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {days.map((day, index) => {
          const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
          const events = date ? getEventsForDate(date) : [];

          return (
            <div key={index} className={`calendar-day ${day ? "active" : "inactive"}`}>
              <div className="day-number">{day}</div>
              {events.map((event, i) => (
                <div key={i} className="event-item">{event.title || event.student_name}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;