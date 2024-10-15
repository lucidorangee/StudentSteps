import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutors');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch students');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

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
  
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentID, setSelectedStudentID] = useState(-1);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [selectedTutorID, setSelectedTutorID] = useState(-1);
  

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
  } = useQuery({queryKey: ['comments'], queryFn: () => fetchComments()});

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});
  
  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({queryKey: ['tutors'], queryFn: () => fetchTutors()});
  

  const [filteredComments, setFilteredComments] = useState([]);

  useEffect(() => {
    if(!comments) return;
    setFilteredComments(comments);
  }, [comments])

  useEffect(() => {
    if(tutors)
    {
      const tutorOptions = [
        { value: -1, label: 'No Filter' },
        ...tutors.map(tutor => ({
          value: tutor.tutor_id,
          label: `${tutor.first_name} (ID: ${tutor.tutor_id})`,
        }))
      ];
      setTutorOptions(tutorOptions);
      setSelectedTutorID(-1);
    }
  }, [tutors]);

  useEffect(() => {
    if(students){
      const options = [
        { value: -1, label: 'No Filter' },
        ...students.map(student => ({
          value: student.student_id,
          label: `${student.first_name} (ID: ${student.student_id})`,
        }))
      ];
      setStudentOptions(options);
      setSelectedStudentID(-1);
    }
  }, [students]);

  //filter
  useEffect(() => {
    if(comments)
    {
      setFilteredComments(
        comments.filter((comment) => {
          if(selectedStudentID === -1 && selectedTutorID === -1) return false;
          if(selectedStudentID === -1) return selectedTutorID === -1 ? false : selectedTutorID === comment.tutor_id;
          if(selectedTutorID === -1) return selectedStudentID === comment.student_id;
          
          return selectedStudentID === comment.student_id && selectedTutorID === comment.tutor_id;
        })
      );
    }
  }, [selectedStudentID, selectedTutorID])

  if (commentsLoading || tutorsLoading || studentsLoading) return <div>Loading...</div>;
  if (commentsError || tutorsError || studentsError) {
    if(commentsError?.status === 401 || tutorsError?.status === 401 || studentsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const handleTutorChange = (selectedOption) => {
    if(selectedOption === null)
    {
      setSelectedTutorID(-1);
    }
    else setSelectedTutorID(selectedOption.value);
  };

  const handleStudentChange = (selectedOption) => {
    if(selectedOption === null)
    {
      setSelectedStudentID(-1);
    }
    else setSelectedStudentID(selectedOption.value);
  };

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <div className="row ms-4 mt-2">
        <div className="col">
          <Select
              options={studentOptions}
              onChange={handleStudentChange}
              placeholder="Search for a student..."
              isClearable
              classNamePrefix="react-select"
            />
        </div>
        <div className="col">
          <Select
            options={tutorOptions}
            onChange={handleTutorChange}
            placeholder="Search for a tutor..."
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        <div className="col">
          hi
        </div>
      </div>
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