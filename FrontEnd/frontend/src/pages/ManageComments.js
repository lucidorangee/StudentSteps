import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const ManageUsers = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [comments, setComments] = useState(null);

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/comments`, {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setComments(data);
      })
      .catch(error => {
        console.error('Error fetching comments: ', error);
      })
  }, []);
  
  //{JSON.stringify(comments, null, 2)}
    return (
      <div>
        {authenticated ? (
          <AuthenticatedOptions comments={comments} />
        ) : (
          <UnauthenticatedOptions />
        )}
      </div>
    );
  };

  const handleDelete = (comment_id) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${comment_id}`, {
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
      console.log(`Comment with ID ${comment_id} deleted successfully`);

      // Refresh after successful deletion
      window.location.reload();
    })
    .catch(error => {
      console.error('Error deleting comment:', error);
    });
  };

  // comment_id | student_id | tutor_id | datetime | content | type | stamps | approved
  const AuthenticatedOptions = ( {comments} ) => {    
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
                    onClick={() => handleDelete(comment.comment_id)}
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