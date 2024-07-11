import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageUsers = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [tutoringsessions, setTutoringSessions] = useState(null);

  useEffect(() => {
    //Fetch authentication status
    fetch('http://localhost:4000/api/v1/tutoringsessions', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setTutoringSessions(data);
      })
      .catch(error => {
        console.error('Error fetching comments: ', error);
      })
  }, []);
  
  //{JSON.stringify(comments, null, 2)}
    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions tutoringsessions={tutoringsessions} />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };

  const handleDelete = (session_id) => {
    fetch(`http://localhost:4000/api/v1/tutoringsessions/${session_id}`, {
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
      console.log(`Session with ID ${session_id} deleted successfully`);

      // Refresh after successful deletion
      window.location.reload();
    })
    .catch(error => {
      console.error('Error deleting session:', error);
    });
  };

  // session_id | student_id | tutor_id | session_datetime | duration | notes | complete
  const AuthenticatedOptions = ( {tutoringsessions} ) => {    
    return (
      <div className="App">
        <h2>Welcome, User!</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Tutor</th>
              <th>Datetime</th>
              <th>Duration</th>
              <th>Notes</th>
              <th>Complete?</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(tutoringsessions) && (tutoringsessions).length > 0 ? (
            (tutoringsessions).map((tutoringsession, index) => (
              <tr key={index}>
                <td>{tutoringsession.session_id}</td>
                <td>{tutoringsession.student_name}</td>
                <td>{tutoringsession.tutor_name}</td>
                <td>{tutoringsession.session_datetime}</td>
                <td>{tutoringsession.duration}</td>
                <td>{tutoringsession.notes}</td>
                <td>{tutoringsession.complete?'O':'X'}</td>
                <td>
                  <i
                    className="bi bi-trash"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDelete(tutoringsession.session_id)}
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

  const UnauthenticatedOptions = () => {
    
    return (
      <div>
        <h2>Please Log In</h2>
      </div>
    );
  };

  export default ManageUsers;