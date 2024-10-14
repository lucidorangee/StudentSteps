import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './css/DailyCalendar.css';

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
  const { date } = useParams();

  const timeonlySetting = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York',
    hour12: false,
  };

  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery({ queryKey: ['tutors'], queryFn: fetchTutors });
  const { data: tutoringSessionData, isLoading: tutoringSessionsLoading, error: tutoringSessionsError } = useQuery({ queryKey: ['tutoringSessions'], queryFn: fetchTutoringSessions });

  if (tutorsLoading || tutoringSessionsLoading) return <div>Loading...</div>;

  if (tutoringSessionsError || tutorsError) {
    if (tutoringSessionsError?.status === 401 || tutorsError?.status === 401) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data: {tutoringSessionsError?.message || tutorsError?.message}</div>;
  }

  const events = tutoringSessionData.map(session => ({
    id: session.session_id,
    resource: session.tutor_id,
    student: session.student_name || 'Unnamed Student',
    start: new Date(session.session_datetime),
    end: new Date(new Date(session.session_datetime).getTime() + session.duration * 60 * 1000),
    slot_length: 1,
  }));

  const timeSlots = [];
  for (let hour = 15; hour <= 20; hour++) {
    timeSlots.push(`${hour}:00`, `${hour}:30`);
  }

  const calculateRowSpan = (start, end) => Math.ceil((end - start) / (30 * 60 * 1000));

  const columnData = {};
  /*
  tutors.forEach(tutor => {
    columnData[tutor.tutor_id] = [1, [Array(timeSlots.length).fill(null)]];
  });*/

  // Helper function to find time slot index
  const findTimeSlotIndex = (date, timeZone) => {
    const options = { hour: '2-digit', minute: '2-digit', timeZone, hour12: false };
    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);
    return timeSlots.indexOf(formattedTime);
  };

  events.forEach(event => {
    const eventDate = new Date(event.start);
    const clientDate = new Date(date);

    if (
      eventDate.getMonth() === clientDate.getMonth() &&
      eventDate.getFullYear() === clientDate.getFullYear()
    ) {

      const tutorId = event.resource;
      if(!columnData[tutorId]) columnData[tutorId] = [1, [Array(timeSlots.length).fill(null)]];

      // Get start and end indices in timeSlots array
      const startIdx = Math.max(0, findTimeSlotIndex(event.start, 'America/New_York')); //might want to Math.min check with 0
      const endIdx = findTimeSlotIndex(event.end, 'America/New_York') - 1;

      // Update maxColumnsPerTutor for each overlapping time slot
      let mycolumn = 0;
      for (let i = startIdx; i <= endIdx; i++) {
        if (i >= 0 && i < timeSlots.length) {
          if(columnData[tutorId][1][mycolumn][i] !== null) 
          {
            mycolumn++;
            if(mycolumn + 1 > columnData[tutorId][0])
            {
              columnData[tutorId][0] = mycolumn + 1;
              columnData[tutorId][1].push(Array(timeSlots.length).fill(null));
            }
             
            i--;
          }
          else 
          {
            event.length = endIdx - startIdx;
            columnData[tutorId][1][mycolumn][i] = i === startIdx ? event : { occupied: true };
          }
        }
      }
    }
  });

  console.log(columnData);

  return (
    <div className="calendar">
      <h1>Schedule for {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</h1>
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header">Time</th>
            {
              Object.keys(columnData).forEach(tutor_id => {                
                return (
                  <th key={`${tutor_id}`} className="tutor-header" colSpan={columnData[tutor_id][0]}>
                    {tutors.find((tutor) => tutor.tutor_id === Number(tutor_id))?.first_name} 
                  </th>
                );
              })
            }
          </tr>
        </thead>
        
      </table>
    </div>
  );
};

export default ScheduleDaily;
