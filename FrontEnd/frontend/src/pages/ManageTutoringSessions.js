import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchTutoringSessions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutoring sessions');
    err.status = response.status;
    throw err;
  }
  return response.json();
}

const deleteTutoringSession = async (session_id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions/${session_id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to update tutoring session: ' + responseText);
  }

  return session_id;
};

const ManageTutoringSessions = () => {
  const queryClient = useQueryClient();

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const { mutate: removeTutoringSession, isLoading, isError, error } = useMutation({
    mutationFn: ({ session_id }) => deleteTutoringSession( session_id ),
    onSuccess: (session_id) => {
      console.log(`Session with ID ${session_id} deleted successfully`);

      // Refresh after successful deletion
      // window.location.reload();
      queryClient.invalidateQueries(['tutoringSessions']);
    },
    onError: (error) => {
      console.log('Error updating the tutoring session:', error.message);
    }
  });

  
  if (tutoringSessionsLoading) return <div>Loading...</div>;

  if (tutoringSessionsError) {
    if (tutoringSessionsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message}</div>;
  }

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
        {Array.isArray(tutoringSessions) && (tutoringSessions).length > 0 ? (
          (tutoringSessions).map((tutoringsession, index) => (
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
                  onClick={() => removeTutoringSession({session_id: tutoringsession.session_id})}
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

  export default ManageTutoringSessions;