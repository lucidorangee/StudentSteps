import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { subWeeks } from 'react-datepicker/dist/date_utils';

const fetchSubjects = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/subjects`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch subjects');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const postSubject = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/subjects`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const responseText = response.json().message;
    const err = new Error('Subject creation failed:', response.responseText); // Include responseText in the error for context
    err.status = response.status;
    throw err;
  }

  return response.json();
}

const putSubject = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/subjects`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const responseText = response.json().message;
    const err = new Error('Subject rename failed:', response.responseText); // Include responseText in the error for context
    err.status = response.status;
    throw err;
  }

  return response.json();
}

const deleteSubject = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/subjects`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const responseText = response.json().message;
    const err = new Error('Subject deletion failed:', response.responseText); // Include responseText in the error for context
    err.status = response.status;
    throw err;
  }

  return response.json();
}

const ManageSubjects = () => {
  //const [tutors, setTutors] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterName, setFilterName] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(null);

  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useQuery({
    queryKey: ['subjects'], 
    queryFn: () => fetchSubjects(),
  });

  const { mutate: createSubject, createSubjectIsLoading, createSubjectIsError, createSubjectError } = useMutation({
    mutationFn: (formData) => postSubject(formData),
    onSuccess: () => {
      console.log('Subject creation successful!');
      queryClient.invalidateQueries(['queryKey']);
    },
    onError: (error) => {
      console.log('Error creating subject: ', error.message);
    }
  });

  const { mutate: removeSubject, deleteSubjectIsLoading, deleteSubjectIsError, deleteSubjectError } = useMutation({
    mutationFn: (formData) => deleteSubject(formData),
    onSuccess: () => {
      console.log('Subject deletion successful!');
      queryClient.invalidateQueries(['queryKey']);
    },
    onError: (error) => {
      console.log('Error deletion subject: ', error.message);
    }
  });

  const { mutate: renameSubject, renameSubjectIsLoading, renameSubjectIsError, renameSubjectError } = useMutation({
    mutationFn: (formData) => putSubject(formData),
    onSuccess: () => {
      console.log('Subject rename successful!');
      queryClient.invalidateQueries(['queryKey']);
    },
    onError: (error) => {
      console.log('Error renaming subject: ', error.message);
    }
  });

  useEffect(() => {
    if (subjects) {
      setFilteredSubjects(subjects); // Initialize filteredStudents with the fetched data
    }
  }, [subjects]);

  if (subjectsLoading) return <div>Loading...</div>;
  if (subjectsError) {
    if(subjectsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }


  const handleFilterNameChange = (e) => {
    const { value } = e.target;
    setFilterName(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let temp = [];
    for(let i = 0; i < tutors.length; i++)
    {
      if((subjects[i].name.includes(filterName)))
          temp.push(subjects[i]);
    }
    setFilteredSubjects(temp);
  };
  
  
  return (
    <div className="container my-4">
      <h1 className="mb-4">Manage Subjects</h1>
      
      {/* Filter Section */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Filter subjects by name"
            value={filterName}
            onChange={handleFilterNameChange}
          />
          <button type="submit" className="btn btn-primary">Filter</button>
        </div>
      </form>
      
      {/* Subjects Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubjects && filteredSubjects.map((subject, index) => (
            <tr key={subject.id}>
              <td>{index + 1}</td>
              <td>{subject.name}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => {
                    const newName = prompt(`Rename subject "${subject.name}" to:`);
                    if (newName) {
                      renameSubject({ old_name: subject.name, new_name: newName });
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
                      removeSubject({ subject_name: subject.name });
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {/* Add Subject Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newSubject = e.target.subjectName.value.trim();
          if (newSubject) {
            createSubject({ subject_name: newSubject });
            e.target.reset();
          } else {
            alert('Subject name cannot be empty!');
          }
        }}
        className="mt-4"
      >
        <div className="input-group">
          <input
            type="text"
            name="subjectName"
            className="form-control"
            placeholder="Add new subject"
          />
          <button type="submit" className="btn btn-success">Add</button>
        </div>
      </form>
    </div>
  );
  

};

export default ManageSubjects;