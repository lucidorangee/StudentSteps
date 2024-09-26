import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch users');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const deleteUserByID = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`, {
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
  const queryClient = useQueryClient();

  //const [userData, setUserData] = useState(null);
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
  const { mutate: deleteUser, isLoading, isError, error } = useMutation({
    mutationFn: (id) => deleteUserByID(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      console.log("Successfully deleted");
    },
    onError: (error) => {
      console.log('Error deleting user:', error.message);
    }
  });

  const {
    data: userData,
    isLoading: userDataLoading,
    error: userDataError,
  } = useQuery({queryKey: ['users'], queryFn: () => fetchStudents()});

  if (userDataLoading) return <div>Loading...</div>;
  if (userDataError) {
    if(userDataError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(userDataError.status);
    return <div>Error loading data</div>;
  }
  /*

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/users`, {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data: ', error);
      })
  }, []);*/

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Username</th>
            <th>Encrypted Password</th>
            <th>Role</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(userData.userData) && (userData.userData).length > 0 ? (
          (userData.userData).map((user, index) => (
            <tr key={index}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>{user.role}</td>
              <td>
                <i
                  className="bi bi-trash"
                  style={{ cursor: 'pointer' }}
                  onClick={() => deleteUser(user.id)}
                ></i>
              </td>
            </tr>
          ))):(
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
  );
};

export default ManageUsers;