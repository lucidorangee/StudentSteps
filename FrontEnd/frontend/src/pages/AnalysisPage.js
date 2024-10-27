import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';

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
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

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

  }, [comments]);

  useEffect(() => {
    if(!comments) return;
    let total = 0;
    let count = 0;

    for(const comment of comments)
    {
      const comment_datetime = new Date(comment.datetime);
      
      console.log(`selectedDay: ${selectedDay} / comment_datetime.getDate: ${comment_datetime.getDate()}`);
      console.log(`selectedMonth: ${selectedMonth} / comment_datetime.getMonth: ${comment_datetime.getMonth()}`);
      console.log(`selectedYear: ${selectedYear} / comment_datetime.getFullYear: ${comment_datetime.getFullYear()}`);

      if(selectedDay !== '' && comment_datetime.getDate() !== Number(selectedDay)) continue;
      if(selectedMonth !== '' && comment_datetime.getMonth() !== Number(selectedMonth)) continue;
      if(selectedYear !== '' && comment_datetime.getFullYear() !== Number(selectedYear)) continue;

      if(comment.content === 'noshow') count++;
      total++;
    }

    const temp_noshowdata = [
      { ...noShowData[0], value: total - count },
      { ...noShowData[1], value: count },
    ];
    setNoShowData(temp_noshowdata);
  }, [selectedDay, selectedMonth, selectedYear])

  if (loading) return <div>Loading...</div>;

  if (tutoringSessionsError) {
    if (tutoringSessionsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message}</div>;
  }

  
  const COLORS = ["#0088FE", "#00C49F"/*, "#FFBB28", "#FF8042"*/];
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2; // Position at midpoint
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleDateChange = () => {
    // Build formatted date based on selected parts
    const formattedDate = [
      selectedYear,
      selectedMonth.padStart(2, '0'),
      selectedDay.padStart(2, '0')
    ]
      .filter(Boolean) // Remove empty values
      .join('-');
    
    navigate(`/admin/analysis/${formattedDate}`);
  };

  const handleDateReset = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedDay('');
    navigate(`/admin/analysis/`);
  };

  const setDateToToday = () => {
    const today = new Date();
    
    setSelectedYear(String(today.getFullYear()));
    setSelectedMonth(String(today.getMonth()).padStart(2, '0'));
    setSelectedDay(String(today.getDate().padStart(2, '0')));

    const formattedDate = [
      selectedYear,
      selectedMonth.padStart(2, '0'),
      selectedDay.padStart(2, '0')
    ]
      .filter(Boolean) // Remove empty values
      .join('-');
    
    navigate(`/admin/analysis/${formattedDate}`);
  };

  

  // Generate options
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  
  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <div className="d-flex align-items-center">
        <select
          className="form-control me-2 w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="form-control me-2 w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          disabled={!selectedYear} // Enable only after selecting the year
        >
          <option value="">Month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="form-control me-2 w-auto"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          disabled={!selectedMonth} // Enable only after selecting the month
        >
          <option value="">Day</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <FaCalendarAlt className="me-2 text-secondary" />
        <button type="button" className="btn btn-info px-4" onClick={setDateToToday} disabled={!selectedYear}>
          Today
        </button>
        <button type="button" className="btn btn-secondary ms-2 px-4" onClick={handleDateReset}>
          Show All
        </button>
      </div>
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