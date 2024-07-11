import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageUsers = () => {
  const [students, setStudents] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setStudents(data);
      })
      .catch(error => {
        console.error('Error fetching students data: ', error);
      })
  }, []);

  const handleDelete = (student_id) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${student_id}`, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log("HERE");
      return response.text();
    })
    .then(data => {
      console.log(`Student with ID ${student_id} deleted successfully`);

      // Refresh after successful deletion
      window.location.reload();
    })
    .catch(error => {
      console.error('Error deleting session:', error);
    });
  };

  const redirectStudentProfile  = (student_id) => {
    navigate(`/students/detail/${student_id}`, { replace : true});

  }

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
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
        {Array.isArray(students) && (students).length > 0 ? (
          (students).map((student, index) => (
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
                  onClick={() => handleDelete(student.student_id)}
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