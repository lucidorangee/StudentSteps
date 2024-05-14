import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageUsers = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [userData, setUserData] = useState(null);
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
    fetch('http://localhost:4000/api/v1/auth/users', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data: ', error);
      })
  }, []);



    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions userData={userData} />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };
  
  const AuthenticatedOptions = (userData) => {
    const userDataString = JSON.stringify(userData, null, 2);
    return (
      <div className="App">
        <h2>Welcome, User!</h2>
        <table class="table">
          <div>{userDataString}</div>
        </table>
        <Nav.Link as={NavLink} to='/Login' exact>Login</Nav.Link>
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