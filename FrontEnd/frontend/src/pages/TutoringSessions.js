import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageTutoringSessions = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [tutoringSessionData, setTutoringSessionData] = useState(null);

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setTutoringSessionData(data);
      })
      .catch(error => {
        console.error('Error fetching session data: ', error);
      })
  }, []);



    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions tutoringSessionData={tutoringSessionData} />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };
  
  const AuthenticatedOptions = (tutoringSessionData) => {
    const tutoringSessionDataString = JSON.stringify(tutoringSessionData.tutoringSessionData, null, 2);
    return (
      <div className="App">
        <h2>Welcome, User!</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Tutor</th>
              <th>Date</th>
              <th>Length</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(tutoringSessionData.tutoringSessionData) && (tutoringSessionData.tutoringSessionData).length > 0 ? (
            (tutoringSessionData.tutoringSessionData).map((tutoringSession, index) => (
              <tr key={index}>
                <td>{tutoringSession.session_id}</td>
                <td>{tutoringSession.student_id}</td>
                <td>{tutoringSession.tutor_id}</td>
                <td>{tutoringSession.session_datetime}</td>
                <td>{tutoringSession.duration}</td>
                <td>{tutoringSession.notes}</td>
              </tr>
            ))):(
              <tr>
                <td colSpan="6">No data available</td>
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

  export default ManageTutoringSessions;