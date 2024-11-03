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

const ManageStudents = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGrade, setFilterGrade] = useState(0);
  const [upcomingAssessmentFilter, setUpcomingAssessmentFilter] = useState(false);
  
  const [filteredStudents, setFilteredStudents] = useState([]);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], refetchOnMount: 'always',queryFn: () => fetchStudents()});

  useEffect(() => {
    if (students) {
      setFilteredStudents(students); // Initialize filteredStudents with the fetched data
    }
  }, [students]);

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['comments'], refetchOnMount: 'always', queryFn: () => fetchComments()});

  if (studentsLoading) return <div>Loading...</div>;
  if (studentsError) {
    if(studentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(studentsError.status);
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

  const handleAssessmentCheckboxChange = (event) => {
    setUpcomingAssessmentFilter(event.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let temp = students.filter(student =>
      (student.first_name.includes(filterName) || student.last_name.includes(filterName)) &&
      (filterGrade === 0 || student.grade_level === filterGrade)
    );

    if(upcomingAssessmentFilter)
    {
      const today = new Date();
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
    
      temp = temp.filter(student =>
        assessments.some(assessment =>
          assessment.student_id === student.student_id &&
          new Date(assessment.date) >= today &&
          new Date(assessment.date) <= sevenDaysFromNow
        )
      );
    }
    
    setFilteredStudents(temp);
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
          <div className="col-md-4">
            <div className="form-check mt-4">
              <input
                type="checkbox"
                id="assessmentUpcoming"
                className="form-check-input"
                onChange={handleAssessmentCheckboxChange}
              />
              <label htmlFor="assessmentUpcoming" className="form-check-label">
                Students with an Assessment upcoming within 7 days
              </label>
            </div>
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
            <th>Student ID</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Stamps</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(filteredStudents) && (filteredStudents).length > 0 ? (
          (filteredStudents).map((student, index) => (
            <tr key={index}>
              <td onClick={() => redirectStudentProfile(student.student_id)}>{student.student_id}</td>
              <td>{student.user_id}</td>
              <td>{student.first_name} {student.last_name}</td>
              <td>{student.student_phone}</td>
              <td>{student.student_email}</td>
              <td>{student.stamps}</td>
            </tr>
          ))):(
            <tr>
              <td colSpan="9">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
  );
};

export default ManageStudents;