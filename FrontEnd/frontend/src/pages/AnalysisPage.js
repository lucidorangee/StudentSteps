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

const PieChart = ({ data, colors }) => {
  const total = data.reduce((sum, value) => sum + value, 0);

  // Function to convert value to an SVG path for each slice
  const getPath = (value, index) => {
    const angle = (value / total) * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;
    const rotation = data.slice(0, index).reduce((sum, val) => sum + (val / total) * 360, 0);

    const x = Math.cos((rotation * Math.PI) / 180);
    const y = Math.sin((rotation * Math.PI) / 180);
    const x1 = Math.cos(((rotation + angle) * Math.PI) / 180);
    const y1 = Math.sin(((rotation + angle) * Math.PI) / 180);

    return `
      M 0 0
      L ${x} ${y}
      A 1 1 0 ${largeArcFlag} 1 ${x1} ${y1}
      Z
    `;
  };

  return (
    <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
      {data.map((value, index) => (
        <path key={index} d={getPath(value, index)} fill={colors[index]} />
      ))}
    </svg>
  );
};

const AnalysisPage = () => {
  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  if (tutoringSessionsLoading) return <div>Loading...</div>;

  if (tutoringSessionsError) {
    if (tutoringSessionsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message}</div>;
  }

  const data = [10, 20, 30, 40]; // Example data values
  const colors = ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"]; // Colors for each slice

  
  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <PieChart data={data} colors={colors} />
    </div>
    
  );
};

export default AnalysisPage;