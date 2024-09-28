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

const CalendarPage = () => {
  
  //const [tutors, setTutors] = useState(null);
  //const [students, setStudents] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  //const [tutoringSessions, setTutoringSessions] = useState(null);
  //const [assessments, setAssessments] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentID, setSelectedStudentID] = useState(-1);
  const [selectedTutor, setSelectedTutor] = useState(null);
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
    if(tutors)
    {
      const tutorOptions = [
        { value: -1, label: 'No Filter' },
        ...tutors.map(tutor => ({
          value: tutor.tutor_id,
          label: `${tutor.first_name} (ID: ${tutor.tutor_id})`,
        }))
      ];
      setTutorOptions(tutorOptions);
      setSelectedTutor(tutorOptions[0]);
      setSelectedTutorID(-1);
    }
  }, [tutors]);

  useEffect(() => {
    if(students){
      const options = [
        { value: -1, label: 'No Filter' },
        ...students.map(student => ({
          value: student.student_id,
          label: `${student.first_name} (ID: ${student.student_id})`,
        }))
      ];
      setStudentOptions(options);
      setSelectedStudent(studentOptions[0]);
      setSelectedStudentID(-1);
    }
  }, [students]);

  useEffect(() => {
    setFilteredAssessments(assessments);
  }, [assessments]);

  useEffect(() => {
    setFilteredTutoringSessions(tutoringSessions);
  }, [tutoringSessions]);

  // Filter when selecting 
  useEffect(() => {
    setFilteredTutoringSessions(
      tutoringSessions.filter((session) => {
        if(selectedStudentID === -1 && selectedTutorID === -1) return false;
        if(selectedStudentID === -1) return selectedTutorID === -1 ? false : selectedTutorID === session.tutor_id;
        if(selectedTutorID === -1) return selectedStudentID === session.student_id;
        
        return selectedStudentID === session.student_id && selectedTutorID === session.tutor_id;
      })
    );

    setFilteredAssessments(
      assessments.filter((session) => {        
        return selectedStudentID === -1 ? false : selectedStudentID === session.student_id;
      })
    );
  }, [selectedStudentID, selectedTutorID])

  if (studentsLoading || tutorsLoading || assessmentsLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (studentsError || tutorsError || assessmentsError || tutoringSessionsError) {
    if(studentsError?.status === 401 || tutorsError?.status === 401 || assessmentsError?.status === 401 || tutoringSessionsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.setMonth(prevMonth.getMonth() + 1)));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.setMonth(prevMonth.getMonth() - 1)));
  };

  const tileContent = ({ date }) => {
    const formattedDate = date.toISOString().split('T')[0];

    const assessmentsForDate = assessments?.filter((item) => {
      try {
        return formattedDate === new Date(item.date).toISOString().split('T')[0];
      } catch (error) {
        console.error('Invalid date value:', item.date, error);
        return false;
      }
    }) || [];

    const tutoringSessionsForDate = tutoringSessions?.filter((item) => {
      try {
        return formattedDate === new Date(item.session_datetime).toISOString().split('T')[0];
      } catch (error) {
        console.error('Invalid date value:', item, error);
        return false;
      }
    }) || [];

    return (
      <div className="event-list">
        {assessmentsForDate.map((item, index) => (
          <p key={index} className="event-item">{item.title}</p>
        ))}
        
        {tutoringSessionsForDate.map((item, index) => (
          <p key={index} className="event-item">{item.student_name}</p>
        ))}
      </div>
    );
  };

  const handleTutorChange = (selectedOption) => {
    setSelectedTutor(selectedOption);
    setSelectedTutorID(selectedOption.value);
  };

  const handleStudentChange = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setSelectedStudentID(selectedOption.value);
  };

  return (
    <div className="container-fluid calendar-page">
      <div className="row ms-4 mt-2">
        <div className="col">
          <Select
              options={studentOptions}
              onChange={handleStudentChange}
              placeholder="Search for a student..."
              isClearable
              classNamePrefix="react-select"
            />
        </div>
        <div className="col">
          <Select
            options={tutorOptions}
            onChange={handleTutorChange}
            placeholder="Search for a tutor..."
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        <div className="col">
          hi
        </div>
      </div>
      <div className="row ms-4 me-4 mt-3">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-primary" onClick={handlePrevMonth}>Previous Month</button>
            <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button className="btn btn-primary" onClick={handleNextMonth}>Next Month</button>
          </div>
          <div className="calendar-container">
            <div className="calendar">
              <Calendar
                value={currentMonth}
                onChange={setCurrentMonth}
                tileContent={tileContent}
                locale="en-US"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
