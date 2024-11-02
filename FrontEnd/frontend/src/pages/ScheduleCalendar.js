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

const CalendarPage = ({ defaultStudentId = -1, onDateClick = null }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentID, setSelectedStudentID] = useState(Number(defaultStudentId) || -1);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [selectedTutorID, setSelectedTutorID] = useState(-1);
  const [filteredTutoringSessions, setFilteredTutoringSessions] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({queryKey: ['tutors'], queryFn: () => fetchTutors()});

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const {
    data: assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
  } = useQuery({queryKey: ['assessments'], queryFn: () => fetchAssessments()});

  useEffect(() => {
    if (students) {
      setStudentOptions([
        { value: -1, label: 'No Filter' },
        ...students.map(student => ({
          value: student.student_id,
          label: `${student.first_name} (ID: ${student.student_id})`,
        })),
      ]);
    }
  }, [students]);

  useEffect(() => {
    if (tutors) {
      setTutorOptions([
        { value: -1, label: 'No Filter' },
        ...tutors.map(tutor => ({
          value: tutor.tutor_id,
          label: `${tutor.first_name} (ID: ${tutor.tutor_id})`,
        })),
      ]);
    }
  }, [tutors]);

  useEffect(() => {
    setFilteredAssessments(assessments || []);
    setFilteredTutoringSessions(tutoringSessions || []);
  }, [assessments, tutoringSessions]);

  useEffect(() => {
    if (tutoringSessions && assessments) {
      setFilteredTutoringSessions(
        tutoringSessions.filter(session =>
          (selectedTutorID === -1 || session.tutor_id === selectedTutorID) &&
          (selectedStudentID === -1 || session.student_id === selectedStudentID)
        )
      );

      setFilteredAssessments(
        assessments.filter(assessment =>
          selectedStudentID === -1 || assessment.student_id === selectedStudentID
        )
      );
    }
  }, [selectedTutorID, selectedStudentID, tutoringSessions, assessments]);

  if (studentsLoading || tutorsLoading || assessmentsLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (studentsError || tutorsError || assessmentsError || tutoringSessionsError) {
    if ([studentsError, tutorsError, assessmentsError, tutoringSessionsError].some(err => err?.status === 401)) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const renderCalendarDays = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = startOfMonth.getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(<div key={`empty-${i}`} className="day empty"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
      const assessmentsForDate = filteredAssessments.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === date;
      });
      const tutoringSessionsForDate = filteredTutoringSessions.filter(item => item.session_datetime.startsWith(date));

      cells.push(
        <div 
          key={day} 
          className="day" 
          onClick={onDateClick ? () => onDateClick(new Date(date)) : null} 
        >
          <div className="date">{day}</div>
          <div className="events">
            {assessmentsForDate.map((assessment, index) => (
              <p 
                key={`assess-${index}`} 
                className="event" 
                onClick={onDateClick ? null : () => alert(`Assessment: ${assessment.title}`)} 
              >
                {assessment.title}
              </p>
            ))}
            {tutoringSessionsForDate.map((session, index) => (
              <p 
                key={`session-${index}`} 
                className="event" 
                onClick={onDateClick ? null : () => alert(`Session with ${session.student_name}`)} 
              >
                {session.student_name}
              </p>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="container-fluid calendar-page">
      {defaultStudentId === -1 && (
        <div className="row ms-4 mt-2">
          <div className="col">
            <Select options={studentOptions} onChange={opt => setSelectedStudentID(opt ? opt.value : -1)} placeholder="Search for a student..." isClearable classNamePrefix="react-select" />
          </div>
          <div className="col">
            <Select options={tutorOptions} onChange={opt => setSelectedTutorID(opt ? opt.value : -1)} placeholder="Search for a tutor..." isClearable classNamePrefix="react-select" />
          </div>
        </div>
      )}
      <div className="row ms-4 me-4 mt-3">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-primary" onClick={handlePrevMonth}>Previous Month</button>
            <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button className="btn btn-primary" onClick={handleNextMonth}>Next Month</button>
          </div>
          <div className="calendar-container">
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div
                  className={`day-header ${day === 'Sat' ? 'sat' : day === 'Sun' ? 'sun' : ''}`}
                  key={day}
                >
                  {day}
                </div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;