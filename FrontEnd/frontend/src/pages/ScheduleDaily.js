import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './css/DailyCalendar.css';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';

// Fetch functions
const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutors');
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
};

const ScheduleDaily = () => {
  const { tempdate } = useParams();
  const [date, setDate] = useState((tempdate) ? new Date(tempdate) : new Date());
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [columnData, setColumnData] = useState({});
  const [startHour, setStartHour] = useState(15);
  const [endHour, setEndHour] = useState(20);
  const [startHourTemp, setStartHourTemp] = useState(15);
  const [endHourTemp, setEndHourTemp] = useState(20);
  const [alert, setAlert] = useState('');

  const timeonlySetting = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York',
    hour12: true,
  };

  const dateonlySetting = {
    timeZone: "America/New_York", // Eastern Time zone
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery({ queryKey: ['tutors'], queryFn: fetchTutors });
  const { data: tutoringSessionData, isLoading: tutoringSessionsLoading, error: tutoringSessionsError } = useQuery({ queryKey: ['tutoringSessions'], queryFn: fetchTutoringSessions });

  // Helper function to find time slot index
  const findTimeSlotIndex = (date, timeZone) => {
    const options = { hour: '2-digit', minute: '2-digit', timeZone, hour12: false };
    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);
    return timeSlots.indexOf(formattedTime);
  };


  useEffect(() => {
    if(!tutoringSessionData) return;

    const temp_events = tutoringSessionData.map(session => ({ 
      id: session.session_id,
      resource: session.tutor_id,
      student: session.student_name || 'Unnamed Student',
      start: new Date(session.session_datetime),
      end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
      slot_length: 1,
    }));
    setEvents(temp_events);
  
    const temp_timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      temp_timeSlots.push(`${hour}:00`, `${hour}:30`);
    }
    setTimeSlots(temp_timeSlots);
  }, [tutoringSessionData, startHour, endHour]);
  
  useEffect(() => {
    if (!events || !timeSlots.length) return;
  
    const temp_columnData = {};
  
    events.forEach(event => {
      const eventDate = new Date(event.start);
      const clientDate = date;
  
      if (
        eventDate.getDay() === clientDate.getDay() &&
        eventDate.getMonth() === clientDate.getMonth() &&
        eventDate.getFullYear() === clientDate.getFullYear()
      ) {
        const tutorId = event.resource;
        if(!temp_columnData[tutorId]) temp_columnData[tutorId] = [1, [Array(timeSlots.length).fill(null)]];
  
        // Get start and end indices in timeSlots array
        const startIdx = Math.max(0, findTimeSlotIndex(event.start, 'America/New_York')); //might want to Math.min check with 0
        const endIdx = findTimeSlotIndex(event.end, 'America/New_York') - 1;
  
        // Update columnData for each overlapping time slot
        let mycolumn = 0;
        for (let i = startIdx; i <= endIdx; i++) {
          if (i >= 0 && i < timeSlots.length) {
            if(temp_columnData[tutorId][1][mycolumn][i] !== null) 
            {
              mycolumn++;
              if(mycolumn + 1 > temp_columnData[tutorId][0])
              {
                temp_columnData[tutorId][0] = mycolumn + 1;
                temp_columnData[tutorId][1].push(Array(timeSlots.length).fill(null));
              }
               
              i--;
            }
            else 
            {
              event.length = endIdx - startIdx;
              temp_columnData[tutorId][1][mycolumn][i] = i === startIdx ? event : { occupied: true };
            }
          }
        }
      }
    })
  
    setColumnData(temp_columnData);
    setLoading(false);
  }, [events, timeSlots, date]);

  if (tutorsLoading || tutoringSessionsLoading || loading) return <div>Loading...</div>;

  if (tutoringSessionsError || tutorsError) {
    if (tutoringSessionsError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message || tutorsError?.message}</div>;
  }

  const handleDateChange = (date) => {
    setLoading(true);
    setDate(date);
  };

  const applyHourRange = () => {
    if(startHourTemp < 0 || startHourTemp > 24)
    {
      setAlert('Please set start hour to a valid hour');
      return;
    }

    if(endHourTemp < 0 || endHourTemp > 24)
    {
      setAlert('Please set end hour to a valid hour');
      return;
    }

    setLoading(true);
    setStartHour(startHourTemp);
    setEndHour(endHourTemp);
  };

  return (
    <div className="calendar">
      <h1>Schedule for {new Intl.DateTimeFormat('en-US', dateonlySetting).format(date)}</h1>

      {alert ? (
        <div>
          <div class="alert alert-danger" role="alert">
            {alert}
          </div>
        </div>
      ) : (
        <div></div>
      )}

      <div className="d-flex align-items-center gap-3">
        <DatePicker
          selected={date}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          className="form-control w-auto"
          placeholderText="Select a date"
        />
        <FaCalendarAlt className="me-2 text-secondary" /> 
      </div>

      <div className="row">
        <div>
          {/* Input for Start Hour */}
          <label htmlFor="start-hour">Start Hour:</label>
          <input 
            type="number" 
            id="start-hour" 
            placeholder="Enter start hour" 
            onChange={(e) => setStartHourTemp(Number(e.target.value))}
          />

          {/* Input for End Hour */}
          <label htmlFor="end-hour">End Hour:</label>
          <input 
            type="number" 
            id="end-hour" 
            placeholder="Enter end hour" 
            onChange={(e) => setEndHourTemp(Number(e.target.value))}
          />

          {/* Apply Button */}
          <button onClick={applyHourRange}>Apply</button>
        </div>
      </div>
      
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {
              Object.keys(columnData).map((tutor_id) => { 
                const tutor = tutors.find((tutor) => tutor.tutor_id === Number(tutor_id));
                return (
                  <th key={`${tutor_id}`} className="tutor-header" colSpan={columnData[tutor_id][0]}>
                    {tutor?.first_name} {tutor?.last_name} 
                  </th>
                );
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            timeSlots.map((time, timeIndex) => (
              <tr key={time}>
                <td className="time-cell">{time}</td>
                {
                  Object.keys(columnData).map((tutor_id) => {                 
                    return columnData[tutor_id][1].map((col, colIndex) => {
                      if( col[timeIndex] === null)
                      {
                        return (
                          <td key={`${tutor_id}-${colIndex}-${timeIndex}`} className="no-session">
                            <div>No session</div>
                          </td>
                        );
                      }

                      if( col[timeIndex].occupied )
                      {
                        return null;
                      }

                      return (
                        <td key={`${tutor_id}-${colIndex}-${timeIndex}`} className="session-cell" rowSpan={col[timeIndex].length + 1}>
                          <div className="session">{col[timeIndex].student}<br />
                          {new Intl.DateTimeFormat('en-US', timeonlySetting).format(col[timeIndex].start)} - {new Intl.DateTimeFormat('en-US', timeonlySetting).format(col[timeIndex].end)}</div>
                        </td>
                      );
                    });
                  })
                }
              </tr>
            ))
            
          }
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDaily;
