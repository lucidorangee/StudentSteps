import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchRoles = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/roles`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homework');
  }
  return response.json();
};

const putRoles = async (roleStates) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/roles`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleStates),
    credentials: 'include',
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to edit roles: ' + responseText); // Include responseText in the error for context
  }

  return;
}

const ManageRoles = () => {
  const [userData, setUserData] = useState(null);
  const [roleStates, setRoleStates] = useState([]);
  const queryClient = useQueryClient();

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({queryKey: ['roles'], refetchOnMount: 'always', queryFn: () => fetchRoles()});

  useEffect(() => {
    if(!roles) return;

    const initialRoleStates = Array.isArray(roles) ? roles.map((role) => ({
      ...role,
      checked: false,
    })) : [];
    
    setRoleStates(initialRoleStates);
  }, [roles]);

  const { mutate: handleConfirmChanges, isLoading, isError, error } = useMutation({
    mutationFn: (roleStates) => putRoles(roleStates),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      console.log("Successfully edited");
    },
    onError: (error) => {
      console.log('Error editing roles:', error.message);
    }
  });

  if (rolesLoading) return <div>Loading...</div>;
  if (rolesError) {
    if(rolesError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(rolesError.status);
    return <div>Error loading data</div>;
  }

  const toggleActive = (name, permission) => {
    setRoleStates((prevRoleStates) =>
      prevRoleStates.map((role) =>
        role.name === name ? { 
          ...role, 
          [permission]: !role[permission] 
        } : role
      )
    );
  };
  
  return (
    <div className="App">
      <h2>Manage Roles</h2>
      <table className="table custom-table">
        <thead>
          <tr>
            <th>name</th>
            <th>perm_read</th>
            <th>perm_write</th>
            <th>perm_delete</th>
            <th>comments_read</th>
            <th>comments_write</th>
            <th>comments_edit</th>
            <th>all_calendar_read</th>
            <th>all_calendar_write</th>
            <th>all_calendar_edit</th>
            <th>self_calendar_read</th>
            <th>self_calendar_write</th>
            <th>self_calendar_edit</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(roleStates) && (roleStates).length > 0 ? (
          (roleStates).map((role, index) => (
            <tr key={index}>
              <td>{role.name}</td>
              <td onClick={() => toggleActive(role.name, 'perm_read')} className={role.perm_read ? 'active' : 'inactive'}>
                  {role.perm_read ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'perm_write')} className={role.perm_write ? 'active' : 'inactive'}>
                  {role.perm_write ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'perm_delete')} className={role.perm_delete ? 'active' : 'inactive'}>
                  {role.perm_delete ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'comments_read')} className={role.comments_read ? 'active' : 'inactive'}>
                  {role.comments_read ? 'O' : 'X'}
              </td><td onClick={() => toggleActive(role.name, 'comments_write')} className={role.comments_write ? 'active' : 'inactive'}>
                  {role.comments_write ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'comments_edit')} className={role.comments_edit ? 'active' : 'inactive'}>
                  {role.comments_edit ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'all_calendar_read')} className={role.all_calendar_read ? 'active' : 'inactive'}>
                  {role.all_calendar_read ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'all_calendar_write')} className={role.all_calendar_write ? 'active' : 'inactive'}>
                  {role.all_calendar_write ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'all_calendar_edit')} className={role.all_calendar_edit ? 'active' : 'inactive'}>
                  {role.all_calendar_edit ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'self_calendar_read')} className={role.self_calendar_read ? 'active' : 'inactive'}>
                  {role.self_calendar_read ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'self_calendar_write')} className={role.self_calendar_write ? 'active' : 'inactive'}>
                  {role.self_calendar_write ? 'O' : 'X'}
              </td>
              <td onClick={() => toggleActive(role.name, 'self_calendar_edit')} className={role.self_calendar_edit ? 'active' : 'inactive'}>
                  {role.self_calendar_edit ? 'O' : 'X'}
              </td>
            </tr>
          ))):(
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => handleConfirmChanges(roleStates)}>Apply Changes</button>
    </div>
  );

};

export default ManageRoles;