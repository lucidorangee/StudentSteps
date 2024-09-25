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

const deleteStudentByID = async (student_id) => {
  const response = fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${student_id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to delete student: ' + responseText); // Include responseText in the error for context
  }

  return;
}

const ManageUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGrade, setFilterGrade] = useState(0);
  
  const [filteredStudents, setFilteredStudents] = useState([]);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  useEffect(() => {
    if (students) {
      setFilteredStudents(students); // Initialize filteredStudents with the fetched data
    }
  }, [students]);

  const { mutate: deleteStudent, isLoading, isError, error } = useMutation({
    mutationFn: (student_id) => deleteStudentByID(student_id),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      console.log("Successfully deleted");
    },
    onError: (error) => {
      console.log('Error adding tutor:', error.message);
    }
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let temp = [];
    for(let i = 0; i < students.length; i++)
    {
      if((students[i].first_name.includes(filterName) || students[i].last_name.includes(filterName))
        && (filterGrade === 0 || students[i].grade_level === filterGrade))
          temp.push(students[i]);
    }
    setFilteredStudents(temp);
  };

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <form onSubmit={handleSubmit}>
        <div className="container-fluid m-3">
          <div className="row g-3">
            <div className="col-3">
              <label htmlFor="FormControlInput1" className="form-label">Name</label>
              <input
                type="text"
                value={filterName}
                onChange={handleFilterNameChange}
              />
            </div>
            <div className="col-3">
              <label htmlFor="FormControlInput2" className="form-label">Grade</label>
              <input
                type="text"
                value={filterGrade}
                onChange={handleFilterGradeChange}
              />
            </div>
            <div className="col-3">
              <button type="submit" className="btn btn-primary mb-3">Apply Filter</button>
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
            <th>Delete</th>
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
              <td>
                <i
                  className="bi bi-trash"
                  style={{ cursor: 'pointer' }}
                  onClick={() => deleteStudent(student.student_id)}
                ></i>
              </td>
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

export default ManageUsers;