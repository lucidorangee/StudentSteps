import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = new Error("Failed to fetch students");
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchComments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = new Error("Failed to fetch comments");
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchAssessments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assessments/`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = new Error("Failed to fetch assessments");
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchTutoringSessions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = new Error("Failed to fetch tutoring sessions");
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const EdCoordinator = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAll, setShowAll] = useState(true);
  const [showWithoutAssessments, setShowWithoutAssessments] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState([]);

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ["students"],
    refetchOnMount: "always",
    queryFn: fetchStudents,
  });

  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ["comments"],
    refetchOnMount: "always",
    queryFn: fetchComments,
  });

  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useQuery({
    queryKey: ["assessments"],
    refetchOnMount: "always",
    queryFn: fetchAssessments,
  });

  const { data: tutoringSessions, isLoading: tutoringSessionsLoading, error: tutoringSessionsError } = useQuery({
    queryKey: ["tutoringSessions"],
    refetchOnMount: "always",
    queryFn: fetchTutoringSessions,
  });

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
    setShowAll(false);
  };

  const toggleShowWithoutAssessments = () => {
    if (!showWithoutAssessments) {
      setShowAll(false);
    }
    setShowWithoutAssessments(!showWithoutAssessments);
  };

  const handleShowAll = () => {
    setFilterDate(null);
    setShowAll(true);
    setShowWithoutAssessments(false);
  };

  useEffect(() => {
    if (assessments && tutoringSessions) {
      filterData();
    }
  }, [assessments, tutoringSessions, filterDate, showAll, showWithoutAssessments]);

  const filterData = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const filteredAssessments = assessments.filter((assessment) => {
      const assessmentDate = new Date(assessment.date);
      return (
        (assessmentDate >= today && assessmentDate <= sevenDaysFromNow) ||
        (!assessment.reviewed && assessment.outcome)
      );
    });

    const filteredSessions = tutoringSessions.filter((session) => {
      const sessionDate = new Date(session.session_datetime).toISOString().slice(0, 10);
      const matchesDateFilter =
        showAll || (filterDate && sessionDate === filterDate) || (showWithoutAssessments && sessionDate > filterDate);

      const hasValidAssessment = filteredAssessments.some(
        (assessment) => assessment.student_id === session.student_id
      );

      return matchesDateFilter && !hasValidAssessment;
    });

    setFilteredSessions([...filteredAssessments, ...filteredSessions]);
  };

  if (studentsLoading || commentsLoading || assessmentsLoading || tutoringSessionsLoading) {
    return <div>Loading...</div>;
  }

  if (studentsError || commentsError || assessmentsError || tutoringSessionsError) {
    const unauthorized =
      studentsError?.status === 401 ||
      commentsError?.status === 401 ||
      assessmentsError?.status === 401 ||
      tutoringSessionsError?.status === 401;

    return unauthorized ? <Navigate to="/login" /> : <div>Error loading data {studentsError?.status}</div>;
  }

  return (
    <div className="App container mt-4">
      <h2 className="text-center mb-4">Welcome, User!</h2>
      <form className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="filterDate" className="form-label">Filter Date</label>
            <input
              type="date"
              id="filterDate"
              className="form-control"
              value={filterDate || ""}
              onChange={handleDateChange}
              disabled={showAll}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={handleShowAll}
              disabled={showAll}
            >
              Show All
            </button>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="showWithoutAssessments"
                checked={showWithoutAssessments}
                onChange={toggleShowWithoutAssessments}
                disabled={!filterDate}
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
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => {
              const student = students.find((s) => s.student_id === session.student_id);
              const assessment = assessments.find((a) => a.student_id === session.student_id);
              const latestComment = comments
                .filter((comment) => comment.student_id === session.student_id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

              return (
                <React.Fragment key={index}>
                  <tr onClick={() => toggleRow(index)} style={{ cursor: "pointer" }}>
                    <td>{student ? `${student.first_name} ${student.last_name}` : "Unknown"}</td>
                    <td>{assessment ? assessment.title : "-"}</td>
                    <td>{assessment ? assessment.description : "-"}</td>
                    <td>{assessment ? new Date(assessment.date).toLocaleString() : "-"}</td>
                    <td>{new Date(session.session_datetime).toLocaleString()}</td>
                  </tr>
                  {expandedRow === index && (
                    <tr>
                      <td colSpan="5" className="p-3 bg-light border rounded">
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={assessment ? assessment.outcome || latestComment?.content || "No data" : "No data"}
                          disabled
                        />
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Add notes here..."
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No sessions available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EdCoordinator;