import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
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

const deleteTutorByID = async (tutor_id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/${tutor_id}`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to delete Tutor: ' + responseText); 
  }

  return;
}

const ManageUsers = () => {
  //const [tutors, setTutors] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  
  const [filteredTutors, setFilteredTutors] = useState(null);

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({
    queryKey: ['tutors'], 
    queryFn: () => fetchTutors(),
    retry: (failureCount, error) => {
      // Only retry if error is not 401
      return error.status !== 401;
    },
  });

  useEffect(() => {
    if (tutors) {
      setFilteredTutors(tutors); // Initialize filteredStudents with the fetched data
    }
  }, [tutors]);

  const { mutate: deleteTutor, isLoading, isError, error } = useMutation({
    mutationFn: (tutor_id) => deleteTutorByID(tutor_id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutors']);
      console.log("Successfully deleted");
    },
    onError: (error) => {
      console.log('Error deleting tutor:', error.message);
    }
  });

  const redirectTutorProfile  = (tutor_id) => {
    navigate(`/tutors/detail/${tutor_id}`, { replace : true});
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
      if((tutors[i].first_name.includes(filterName) || tutors[i].last_name.includes(filterName))
        && true)
          temp.push(tutors[i]);
    }
    setFilteredTutors(temp);
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
              <button type="submit" className="btn btn-primary mb-3">Apply Filter</button>
            </div>
          </div>
        </div>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Tutor ID</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(filteredTutors) && (filteredTutors).length > 0 ? (
          (filteredTutors).map((tutor, index) => (
            <tr key={index}>
              <td onClick={() => redirectTutorProfile(tutor.tutor_id)}>{tutor.tutor_id}</td>
              <td>{tutor.user_id}</td>
              <td>{tutor.first_name} {tutor.last_name}</td>
              <td>{tutor.contact_phone}</td>
              <td>{tutor.contact_email}</td>
              <td>
                <i
                  className="bi bi-trash"
                  style={{ cursor: 'pointer' }}
                  onClick={() => deleteTutor(tutor.tutor_id)}
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