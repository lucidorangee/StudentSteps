import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Select from 'react-select';
import './css/custom-calendar.css'; // Import custom calendar CSS

const CalendarPage = () => {
  
  const [tutors, setTutors] = useState(null);
  const [students, setStudents] = useState(null);
  const [tutoringSessions, setTutoringSessions] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentID, setSelectedStudentID] = useState(-1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [selectedTutorID, setSelectedTutorID] = useState(-1);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorsAndStudents = async () => {
      try {
        const [tutorResponse, studentResponse] = await Promise.all([
          fetch('http://localhost:4000/api/v1/tutors', {
            credentials: 'include'
          }),
          fetch('http://localhost:4000/api/v1/students', {
            credentials: 'include'
          }),
        ]);
  
        if (!tutorResponse.ok || !studentResponse.ok) throw new Error('One or more fetch requests failed');
  
        const tutorData = await tutorResponse.json();
        const studentData = await studentResponse.json();
  
        setTutors(tutorData);
        const tutorOptions = [
          { value: -1, label: 'No Filter' },
          ...studentData.map(student => ({
            value: student.student_id,
            label: `${student.first_name} (ID: ${student.student_id})`,
          }))
        ];
        setTutorOptions(tutorOptions);
        setSelectedTutor(tutorOptions[0]);
        setSelectedTutorID(-1);
        
  
        setStudents(studentData);
        const options = [
          { value: -1, label: 'No Filter' },
          ...studentData.map(student => ({
            value: student.student_id,
            label: `${student.first_name} (ID: ${student.student_id})`,
          }))
        ];
        setStudentOptions(options);
        setSelectedStudent(studentOptions[0]);
        setSelectedStudentID(-1);
      } catch (error) {
        console.error("Error fetching tutors and students: ", error);
      }
    };
  
    fetchTutorsAndStudents();
  }, []);
  
  useEffect(() => {
    const fetchTutoringSessionsAndAssessments = async () => {
      try {
        const [tutoringSessionsResponse, assessmentsResponse] = await Promise.all([
          fetch(`http://localhost:4000/api/v1/tutoringsessions?${selectedStudentID===-1?0:"student_id="+selectedStudentID}`, {
            credentials: 'include'
          }),
          fetch('http://localhost:4000/api/v1/assessments', {
            credentials: 'include'
          }),
        ]);
  
        if (!tutoringSessionsResponse.ok || !assessmentsResponse.ok) throw new Error('One or more fetch requests failed');
  
        const tutoringSessionsData = await tutoringSessionsResponse.json();
        const assessmentsData = await assessmentsResponse.json();
  
        setTutoringSessions(tutoringSessionsData);
        setAssessments(assessmentsData);
      } catch (error) {
        console.error("Error fetching tutoring sessions and assessments: ", error);
      } finally {
        console.log("Loading done");
        setLoading(false);
      }
    };
  
    fetchTutoringSessionsAndAssessments();
  }, [selectedStudentID]);

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

  if(loading)
  {
    return (
      <div>loading...</div>
    )
  }
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
