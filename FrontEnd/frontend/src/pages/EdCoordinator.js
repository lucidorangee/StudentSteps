import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import Select from 'react-select';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';


const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
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

const fetchComments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch comments');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchAssessments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assessments/`, {
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

const EdCoordinator = () => {
  const navigate = useNavigate();

  const [expandedRow, setExpandedRow] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterGrade, setFilterGrade] = useState(0);
  const [filteredAssessments, setFilteredAssessments] = useState([]);

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['students'],
    refetchOnMount: 'always',
    queryFn: fetchStudents,
  });

  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['comments'],
    refetchOnMount: 'always',
    queryFn: fetchComments,
  });

  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useQuery({
    queryKey: ['assessments'],
    refetchOnMount: 'always',
    queryFn: fetchAssessments,
  });

  const { data: tutoringSessions, isLoading: tutoringSessionsLoading, error: tutoringSessionsError } = useQuery({
    queryKey: ['tutoringSessions'],
    refetchOnMount: 'always',
    queryFn: fetchTutoringSessions,
  });

  useEffect(() => {
    if (students && comments && assessments && tutoringSessions) {
      filterAssessments();
    }
  }, [students, comments, assessments, tutoringSessions]);

  const filterAssessments = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const filteredAssessments = assessments.filter((assessment) => {
      const assessmentDate = new Date(assessment.date);
      return (
        (assessmentDate >= today && assessmentDate <= sevenDaysFromNow) ||
        (assessment.reviewed === false && assessment.outcome !== "")
      );
    });

    setFilteredAssessments(filteredAssessments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    filterAssessments();
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleNotesChange = (assessment, newNotes) => {
    assessment.outcome = newNotes;
  };

  const handleFilterNameChange = (e) => setFilterName(e.target.value);
  const handleFilterGradeChange = (e) => setFilterGrade(parseInt(e.target.value) || 0);

  if (studentsLoading || commentsLoading || assessmentsLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (studentsError || commentsError || assessmentsError || tutoringSessionsError) {
    const unauthorized =
      studentsError?.status === 401 ||
      commentsError?.status === 401 ||
      assessmentsError?.status === 401 ||
      tutoringSessionsError?.status === 401;
    return unauthorized ? <Navigate to="/login" /> : <div>Error loading data</div>;
  }

  return (
    <div className="App container mt-4">
      <h2 className="text-center mb-4">Welcome, User!</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="filterName" className="form-label">Name</label>
            <input
              type="text"
              id="filterName"
              className="form-control"
              value={filterName}
              onChange={handleFilterNameChange}
              placeholder="Enter name"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="filterGrade" className="form-label">Grade</label>
            <input
              type="number"
              id="filterGrade"
              className="form-control"
              value={filterGrade}
              onChange={handleFilterGradeChange}
              placeholder="Enter grade"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">Apply Filter</button>
          </div>
        </div>
      </form>
      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Assessment Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Upcoming Tutoring Session</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment, index) => {
              const student = students.find(s => s.student_id === assessment.student_id);
              if (!student) return null;
  
              const latestComment = comments
                .filter(comment => comment.student_id === assessment.student_id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
              console.log(`latest comment is ${JSON.stringify(latestComment)}`);

              const upcomingSession = tutoringSessions
                .filter(session => session.student_id === assessment.student_id && new Date(session.session_datetime) > new Date())
                .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))[0];
  
              return (
                <React.Fragment key={index}>
                  <tr onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{assessment.title}</td>
                    <td>{assessment.description}</td>
                    <td>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(assessment.date))}</td>
                    <td>{upcomingSession ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(upcomingSession.session_datetime)) : 'N/A'}</td>
                  </tr>
                  {expandedRow === index && (
                    <tr>
                      <td colSpan="5" className="p-3 bg-light border rounded">
                        <div className="mb-3">
                          <label 
                            htmlFor={`disabled-${assessment.assessment_id}`} 
                            className="form-label fw-bold"
                          >
                            {assessment.reviewed === false && assessment.outcome !== "" && assessment.outcome !== null
                              ? "Outcome"
                              : "Latest Comment"}
                          </label>
                          {/* Grayed-out textbox for the existing value */}
                          <input
                            type="text"
                            id={`disabled-${assessment.assessment_id}`}
                            className="form-control mb-2"
                            value={
                              assessment.reviewed === false && assessment.outcome !== ""
                                ? assessment.outcome || ""
                                : latestComment?.note || "No comments available"
                            }
                            disabled
                            aria-label="Read-only field for latest comment or outcome"
                            style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
                          />
                          {/* Editable textarea for modifications */}
                          <textarea
                            id={`notes-${assessment.assessment_id}`}
                            className="form-control"
                            rows={4}
                            placeholder="Modify notes here..."
                            value={assessment.reviewed === false && assessment.outcome !== "" ? 
                              assessment.outcome || "" : latestComment?.note || ""
                              }
                            onChange={(e) => handleNotesChange(assessment, e.target.value)}
                            aria-label="Editable notes field"
                            style={{ resize: 'none', overflowY: 'auto' }}
                          />
                        </div>
                        <button 
                          className="btn btn-success w-100 mt-2" 
                          onClick={() => null}
                          aria-label="Submit changes"
                        >
                          Submit Changes
                        </button>
                      </td>
                    </tr>
                  )}


                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
};

export default EdCoordinator;