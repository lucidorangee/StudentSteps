import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageUsers = () => {
  const [tutors, setTutors] = useState(null);
  const navigate = useNavigate();
/*
  useEffect(() => {
    //Fetch authentication status
    fetch('http://localhost:4000/users/status')
      .then(response => response.json())
      .then(data => {
        setAuthenticated(data.isAuthenticated);
      })
      .catch(error => {
        console.error('Error fetching authentication status: ', error);
      })
  }, []);*/

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setTutors(data);
      })
      .catch(error => {
        console.error('Error fetching tutors data: ', error);
      })
  }, []);
  
  //{JSON.stringify(comments, null, 2)}
    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions tutors={tutors} />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };

  const handleDelete = (tutor_id) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/${tutor_id}`, {
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
      console.log(`Tutor with ID ${tutor_id} deleted successfully`);

      // Refresh after successful deletion
      window.location.reload();
    })
    .catch(error => {
      console.error('Error deleting session:', error);
    });
  };

  const redirectTutorProfile  = (tutor_id) => {
    navigate(`/tutors/detail/${tutor_id}`, { replace : true});

  }

  const AuthenticatedOptions = ( {tutors} ) => {    
    return (
      <div className="App">
        <h2>Welcome, User!</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Tutor ID</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(tutors) && (tutors).length > 0 ? (
            (tutors).map((tutor, index) => (
              <tr key={index}>
                <td onClick={() => redirectTutorProfile(tutor.tutor_id)}>{tutor.tutor_id}</td>
                <td>{tutor.user_id}</td>
                <td>{tutor.first_name} {tutor.last_name}</td>
                <td>{tutor.contact_phone}</td>
                <td>{tutor.contact_email}</td>
                <td>
                  <i
                    className="bi bi-trash"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDelete(tutor.tutor_id)}
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