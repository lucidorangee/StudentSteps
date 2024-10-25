import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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

const AnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [noShowData, setNoShowData] = useState([
    { name: "Showed up", value: 1 },
    { name: "NoShow", value: 1 },
  ]);

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['comments'], queryFn: () => fetchComments()});

  useEffect(() => {
    if(!comments) return;
    let total = 0;
    let count = 0;

    for(const comment of comments)
    {
      if(comment.content === 'noshow') count++;
      total++;
    }

    const temp_noshowdata = [
      { ...noShowData[0], value: total - count },
      { ...noShowData[1], value: count },
    ];
    setNoShowData(temp_noshowdata);

    setLoading(false);

  }, [tutoringSessions]);

  if (loading) return <div>Loading...</div>;

  if (tutoringSessionsError) {
    if (tutoringSessionsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message}</div>;
  }

  
  const COLORS = ["#0088FE", "#00C49F"/*, "#FFBB28", "#FF8042"*/];
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const x = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  
  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={noShowData}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {noShowData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
    
  );
};

export default AnalysisPage;