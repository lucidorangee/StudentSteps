import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import Select from 'react-select';
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

const fetchHomework = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
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

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};


const deleteHomeworkByID = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework/${id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to delete homework: ' + responseText); // Include responseText in the error for context
  }

  return;
}

const ManageUsers = () => {
  //const [students, setStudents] = useState(null);
  //const [homework, setHomework] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGrade, setFilterGrade] = useState(0);
  
  const [filteredHomework, setFilteredHomework] = useState(null);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  const {
    data: homeworkList,
    isLoading: homeworkListLoading,
    error: homeworkListError,
  } = useQuery({queryKey: ['homework'], queryFn: () => fetchHomework()});

  const { mutate: deleteHomework, isLoading, isError, error } = useMutation({
    mutationFn: (id) => deleteHomeworkByID(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['homework']);
      console.log("Successfully deleted");
    },
    onError: (error) => {
      console.log('Error deleting homework:', error.message);
    }
  });

  useEffect(() => {
    setFilteredHomework(homeworkList);
  }, [homeworkList])

  // End of Hooks

  if (homeworkListLoading || studentsLoading) return <div>Loading...</div>;
  if (homeworkListError) {
    if(homeworkListError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(homeworkListError.status);
    return <div>Error loading data</div>;
  }
  if (studentsError) {
    if(studentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(studentsError.status);
    return <div>Error loading data</div>;
  }

/*
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setStudents(data);
        })
      .catch(error => {
        console.error('Error fetching students data: ', error);
      })
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/homework/`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
          setHomework(data);
          setFilteredHomework(data);
          setLoading(false);
        })
      .catch(error => {
        console.error('Error fetching homework data: ', error);
      })
  }, []);*/
/*
  const handleDelete = (homework_id) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/homework/${homework_id}`, {
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
      return response.text();
    })
    .then(data => {
      console.log(`Homework with ID ${homework_id} deleted successfully`);

      // Refresh after successful deletion
      window.location.reload();
    })
    .catch(error => {
      console.error('Error deleting session:', error);
    });
  };*/

  const redirectStudentProfile  = (homework_id) => {
    navigate(`/homework/detail/${homework_id}`, { replace : true});
  }

  const handleFilterNameChange = (e) => {
    const { value } = e.target;
    setFilterName(value);
  };

  const handleFilterGradeChange = (e) => {
    const { value } = e.target;
    setFilterGrade(parseInt(value) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let temp = [];
    for(let i = 0; i < homeworkList.length; i++)
    {
      if((students[i].first_name.includes(filterName) || students[i].last_name.includes(filterName))
        && (filterGrade === 0 || students[i].grade_level === filterGrade))
          temp.push(students[i]);
    }
    setFilteredHomework(temp);
  };

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <form onSubmit={handleSubmit}>
        <div className="container-fluid m-3">
          <div className="row g-3">
            <div className="col-3">
              <label htmlFor="FormControlInput1" className="form-label">Name</label>
              <input
                type="text"
                value={filterName}
                onChange={handleFilterNameChange}
              />
            </div>
            <div className="col-3">
              <label htmlFor="FormControlInput2" className="form-label">Grade</label>
              <input
                type="text"
                value={filterGrade}
                onChange={handleFilterGradeChange}
              />
            </div>
            <div className="col-3">
              <button type="submit" className="btn btn-primary mb-3">Apply Filter</button>
            </div>
          </div>
        </div>
      </form>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Homework ID</th>
            <th>Student ID</th>
            <th>Subject</th>
            <th>Assigned on</th>
            <th>Due Date</th>
            <th>Completed?</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
        {!loading && Array.isArray(filteredHomework) && (filteredHomework).length > 0 ? (
          (filteredHomework).map((ahomework, index) => (
            <tr key={index}>
              {//<td onClick={() => redirectStudentProfile(student.student_id)}>{student.student_id}</td>
              }
              <td>{ahomework.homework_id}</td>
              <td>{ahomework.student_id}</td>
              <td>{ahomework.subject}</td>
              <td>{ahomework.assigned}</td>
              <td>{ahomework.due_date}</td>
              <td>{ahomework.is_completed}</td>
              <td>
                <i
                  className="bi bi-trash"
                  style={{ cursor: 'pointer' }}
                  onClick={() => deleteHomework(ahomework.homework_id)}
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

export default ManageUsers;