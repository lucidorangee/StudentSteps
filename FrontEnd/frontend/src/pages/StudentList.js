import React, { useState, useEffect } from 'react';

const StudentList = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/status`)
      .then(response => response.json())
      .then(data => {
        setAuthenticated(data.isAuthenticated);
      })
      .catch(error => {
        console.error('Error fetching authentication status: ', error);
      })
  }, []);



    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };
  
  const AuthenticatedOptions = () => {
    return (
      <div>
      <table class="table">
        
      </table>
        <h2>Welcome, User!</h2>
        <button>Logout</button>
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

  export default StudentList;