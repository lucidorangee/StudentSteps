import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchComments = async() => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch comments');
    err.status = response.status;
    throw err;
  }

  console.log("successfully fetched comments");
  return response.json();
}

const deleteCommentByID = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to delete comment: ' + responseText); // Include responseText in the error for context
  }

  return;
}

const ManageComments = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteComment, isLoading, isError, error } = useMutation({
    mutationFn: (id) => deleteCommentByID(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      console.log("Successfully deleted");
    },
    onError: (error) => {
      console.log('Error deleting comment:', error.message);
    }
  });
  
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['users'], queryFn: () => fetchComments()});
  
  if (commentsLoading) return <div>Loading...</div>;
  if (commentsError) {
    if(commentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(commentsError.status);
    return <div>Error loading data</div>;
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
            <th>Content</th>
            <th>Types</th>
            <th>Stamps Earned</th>
            <th>Approved?</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(comments) && (comments).length > 0 ? (
          (comments).map((comment, index) => (
            <tr key={index}>
              <td>{comment.comment_id}</td>
              <td>{comment.student_id}</td>
              <td>{comment.tutor_id}</td>
              <td>{comment.datetime}</td>
              <td>{comment.content}</td>
              <td>{comment.type}</td>
              <td>{comment.stamps || 0}</td>
              <td>{comment.approved?'O':'X'}</td>
              <td>
                <i
                  className="bi bi-trash"
                  style={{ cursor: 'pointer' }}
                  onClick={() => deleteComment(comment.comment_id)}
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

export default ManageComments;