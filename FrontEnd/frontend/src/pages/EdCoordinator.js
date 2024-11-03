import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import Select from 'react-select';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';


const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
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

const fetchComments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch comments');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchAssessments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assessments/`, {
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

const EdCoordinator = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGrade, setFilterGrade] = useState(0);
  
  const [filteredAssessments, setFilteredAssessments] = useState([]);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], refetchOnMount: 'always',queryFn: () => fetchStudents()});

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['comments'], refetchOnMount: 'always', queryFn: () => fetchComments()});

  const {
    data: assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
  } = useQuery({queryKey: ['assessments'], refetchOnMount: 'always', queryFn: () => fetchAssessments()});

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], refetchOnMount: 'always', queryFn: () => fetchTutoringSessions()});

  useEffect(() => {
    if (students && comments && assessments && tutoringSessions) {
      filterAssessments();
    }
  }, [students, comments, assessments, tutoringSessions]);

  if (studentsLoading || commentsLoading || assessmentsLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (studentsError || commentsError || assessmentsError || tutoringSessionsError) {
    if(studentsError?.status === 401 || commentsError?.status === 401 || assessmentsError?.status === 401 || tutoringSessionsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const redirectStudentProfile  = (student_id) => {
    navigate(`/students/detail/${student_id}`, { replace : true});
  }

  const handleFilterNameChange = (e) => {
    const { value } = e.target;
    setFilterName(value);
  };

  const handleFilterGradeChange = (e) => {
    const { value } = e.target;
    setFilterGrade(parseInt(value) || 0);
  };

  const filterAssessments = () => {
    let temp = [];
  
    // Filter students based on name and grade criteria
    for (let i = 0; i < students.length; i++) {
      if (
        (students[i].first_name.includes(filterName) || students[i].last_name.includes(filterName)) &&
        (filterGrade === 0 || students[i].grade_level === filterGrade)
      ) {
        temp.push(students[i]);
      }
    }
  
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
  
    // Filter assessments within the next 7 days, excluding those in the past, and sorted by closest date
    const tempAssessments = assessments
      .filter(
        assessment =>
          new Date(assessment.date) >= today && new Date(assessment.date) <= sevenDaysFromNow
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    // Only keep assessments related to the filtered students
    const filteredAssessments = tempAssessments.filter(assessment =>
      temp.some(student => student.student_id === assessment.student_id)
    );
  
    // Set the filtered assessments for display
    setFilteredAssessments(filteredAssessments);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    filterAssessments();
  };  

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <form onSubmit={handleSubmit}>
        <div className="container-fluid m-3 p-3 border rounded bg-light">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <label htmlFor="filterName" className="form-label">Name</label>
              <input
                type="text"
                id="filterName"
                className="form-control"
                value={filterName}
                onChange={handleFilterNameChange}
                placeholder="Enter name"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="filterGrade" className="form-label">Grade</label>
              <input
                type="text"
                id="filterGrade"
                className="form-control"
                value={filterGrade}
                onChange={handleFilterGradeChange}
                placeholder="Enter grade"
              />
            </div>
            <div className="col-md-2 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary mt-4">Apply Filter</button>
            </div>
          </div>
        </div>
      </form>
  
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Assessment Title</th>
            <th>Assessment Description</th>
            <th>Assessment Date</th>
            <th>Upcoming Tutoring Session</th>
            <th>Latest Comment</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredAssessments) && filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment, index) => {
              // Find student matching assessment.student_id
              const student = students.find(s => s.student_id === assessment.student_id);
              if (!student) return null; // Skip if student not found
  
              // Find the latest comment for the student
              const latestComment = comments
                .filter(comment => comment.student_id === assessment.student_id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
              // Find the earliest upcoming tutoring session for the student
              const upcomingSession = tutoringSessions
                .filter(session => session.student_id === assessment.student_id && new Date(session.session_datetime) > new Date())
                .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))[0];
  
              return (
                <tr key={index}>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{assessment.title}</td>
                  <td>{assessment.description}</td>
                  <td>{new Date(assessment.date).toLocaleString()}</td>
                  <td>{upcomingSession ? new Date(upcomingSession.session_datetime).toLocaleString() : 'N/A'}</td>
                  <td>{latestComment ? latestComment.note : 'No comments available'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
};

export default EdCoordinator;