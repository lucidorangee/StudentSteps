import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageRoles = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [userData, setUserData] = useState(null);
  const [roleStates, setRoleStates] = useState([]);
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
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/roles`, {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch roles');
        }
  
        const data = await response.json();
        console.log('Fetched roles:', data);
        
        const initialRoleStates = Array.isArray(data) ? data.map((role) => ({
          ...role,
          checked: false,
        })) : [];
        
        setRoleStates(initialRoleStates);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        console.log('Fetching roles completed');
      }
    };
  
    fetchRoles();
  }, []);

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

  const handleConfirmChanges = async (roleStates) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/roles`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleStates),
        credentials: 'include',
      });

      if (response.ok) {
        // Request was successful
        console.log('Put successful!');
        window.location.reload();
      } else {
        // Request failed
        console.error('Put failed', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
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