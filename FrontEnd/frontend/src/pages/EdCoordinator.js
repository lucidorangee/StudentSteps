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
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [showWithoutAssessments, setShowWithoutAssessments] = useState(true);
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
  }, [students, comments, assessments, tutoringSessions, filterDate, showWithoutAssessments]);

  const filterAssessments = () => {
    const selectedDate = filterDate ? new Date(filterDate) : null;

    const filtered = students.map((student) => {
      const studentAssessments = assessments.filter(
        (assessment) => assessment.student_id === student.student_id
      );
      const studentSessions = tutoringSessions
        .filter(
          (session) =>
            session.student_id === student.student_id &&
            (!selectedDate || new Date(session.session_datetime).toDateString() === selectedDate.toDateString())
        )
        .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime));

      if (showWithoutAssessments && !studentAssessments.length && studentSessions.length) {
        return {
          student,
          assessments: [
            {
              title: "-",
              description: "-",
              date: "-",
              reviewed: false,
              outcome: "",
              notes: "",
            },
          ],
          upcomingSession: studentSessions[0],
        };
      }

      return {
        student,
        assessments: studentAssessments.filter(
          (assessment) =>
            assessment.reviewed === false ||
            (!selectedDate || new Date(assessment.date).toDateString() === selectedDate.toDateString())
        ),
        upcomingSession: studentSessions[0],
      };
    });

    setFilteredAssessments(filtered.flatMap((item) =>
      item.assessments.map((assessment) => ({
        student: item.student,
        assessment,
        upcomingSession: item.upcomingSession,
      }))
    ));
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const toggleShowWithoutAssessments = () => {
    setShowWithoutAssessments((prev) => !prev);
    if (!showWithoutAssessments) setFilterDate(new Date().toISOString().slice(0, 10));
  };

  const showAll = () => {
    setFilterDate(null);
    setShowWithoutAssessments(true);
  };

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
      <form className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label htmlFor="filterDate" className="form-label">Date</label>
            <input
              type="date"
              id="filterDate"
              className="form-control"
              value={filterDate || ""}
              onChange={handleDateChange}
              disabled={!showWithoutAssessments}
            />
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <button type="button" className="btn btn-primary me-2" onClick={showAll} disabled={!showWithoutAssessments}>
              Show All
            </button>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showWithoutAssessments"
                checked={showWithoutAssessments}
                onChange={toggleShowWithoutAssessments}
              />
              <label htmlFor="showWithoutAssessments" className="form-check-label">
                Show students without upcoming assessments
              </label>
            </div>
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
            filteredAssessments.map(({ student, assessment, upcomingSession }, index) => {
              const latestComment = comments
                .filter((comment) => comment.student_id === student.student_id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

              return (
                <React.Fragment key={index}>
                  <tr onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{assessment.title}</td>
                    <td>{assessment.description}</td>
                    <td>{assessment.date !== "-" ? new Date(assessment.date).toLocaleDateString() : "-"}</td>
                    <td>{upcomingSession ? new Date(upcomingSession.session_datetime).toLocaleString() : "N/A"}</td>
                  </tr>
                  {expandedRow === index && (
                    <tr>
                      <td colSpan="5">
                        <textarea
                          className="form-control"
                          placeholder="Add notes"
                          value={assessment.notes}
                          onChange={(e) => handleNotesChange(assessment, e.target.value)}
                        />
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
