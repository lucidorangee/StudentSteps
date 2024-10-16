import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchUsers = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/users`, {
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

  console.log("successfully fetched users");
  return response.json();
};

const deleteUserByID = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/users/${id}`, {
    credentials: 'include',
    method: 'delete',
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
  const [filterText, setFilterText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filteredUserData, setFilteredUserData] = useState([]);

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
  } = useQuery({queryKey: ['users'], queryFn: () => fetchUsers()});

  useEffect(() => {
    if(userData) setFilteredUserData(userData);
  }, [userData])

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

  const applyFilter = () => {
    const temp_userData = userData.map((user) => {
      if(!(filterRole === '' || user.role === filterRole)) return false;
      if(String(user.id).includes(filterText)) return true;
      if(String(user.name).includes(filterText)) return true;
      if(String(user.username).includes(filterText)) return true;
      return false;
    });

    setFilteredUserData(temp_userData);
  };

  return (
    <div className="App">
      <h2>Welcome, User!</h2>

      <div className="filter-container d-flex align-items-center gap-3">
        {/* Text Input */}
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Enter text"
          className="form-control w-auto"
        />

        {/* Dropdown Menu */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="form-select w-auto"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>

        {/* Apply Button */}
        <button className="btn btn-primary" onClick={applyFilter}>
          Apply
        </button>
      </div>

      {/* Table of users */}
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
        {Array.isArray(userData) && (userData).length > 0 ? (
          (userData).map((user, index) => (
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