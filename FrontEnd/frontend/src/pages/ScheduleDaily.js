import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "@daypilot/daypilot-lite-react";
import "./css/Calendar.css";
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchHomework = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homework');
  }
  return response.json();
};

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};

const fetchTutors = async() => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
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

const fetchTutoringSessions = async() => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutoring sessions');
    err.status = response.status;
    throw err;
  }

  console.log("successfully fetched tutoring sessions");
  return response.json();
}

const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  }
};

const ScheduleDaily = () => {
  const queryClient = useQueryClient();

  const { date } = useParams();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(date);

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({ queryKey: ['students'], queryFn: () => fetchStudents() });

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({ queryKey: ['tutors'], queryFn: () => fetchTutors() });

  const {
    data: homeworkList,
    isLoading: homeworkListLoading,
    error: homeworkListError,
  } = useQuery({ queryKey: ['homework'], queryFn: () => fetchHomework() });

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionLoading,
    error: tutoringSessionError,
  } = useQuery({ queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions() });

  const config = {
    viewType: "Resources",
    durationBarVisible: true,
    timeRangeSelectedHandling: "Enabled",
    businessBeginsHour: 8,   // adjust start time as needed
    businessEndsHour: 20,    // adjust end time as needed
    resources: tutors?.map(tutor => ({
      id: tutor.tutor_id,
      name: `${tutor.first_name} ${tutor.last_name}`,
    })) || [],
    onTimeRangeSelected: async args => {
      const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      calendar.clearSelection();
      if (!modal.result) return;
      calendar.events.add({
        start: args.start,
        end: args.end,
        resource: args.resource,
        id: DayPilot.guid(),
        text: modal.result,
      });
    },
    onEventClick: async args => {
      await editEvent(args.e);
    },
    contextMenu: new DayPilot.Menu({
      items: [
        {
          text: "Delete",
          onClick: async args => {
            calendar.events.remove(args.source);
          },
        },
        {
          text: "-",
        },
        {
          text: "Edit...",
          onClick: async args => {
            await editEvent(args.source);
          },
        },
      ],
    }),
  };

  const editEvent = async e => {
    const modal = await DayPilot.Modal.prompt("Update event text:", e.text());
    if (!modal.result) return;
    e.data.text = modal.result;
    calendar.events.update(e);
  };

  function intToHexSpread(integer) {
    const MAX_HEX_VALUE = 0xffffff;
    let scrambledInt = integer ^ 0xabcdef;
    scrambledInt = (scrambledInt << 3) ^ (scrambledInt >> 5);
    let hexValue = Math.abs(scrambledInt % (MAX_HEX_VALUE + 1));
    return `#${hexValue.toString(16).padStart(6, '0')}`;
  }

  useEffect(() => {
    if (!tutoringSessionData || !date) return;

    // Filter the sessions for the specific day
    const filteredSessions = tutoringSessionData.filter(session => {
      const sessionDate = new Date(session.session_datetime).toISOString().split('T')[0]; // Get only the date part
      return sessionDate === date; // Compare with the URL date parameter
    });

    setFilteredData(filteredSessions);
  }, [tutoringSessionData, date]);

  // Group by tutor
  useEffect(() => {
    if (!filteredData || !tutors) return;

    const groupedEvents = filteredData.reduce((acc, item) => {
      const tutorId = item.tutor_id;
      if (!acc[tutorId]) {
        acc[tutorId] = [];
      }
      acc[tutorId].push(item);
      return acc;
    }, {});

    const events = Object.entries(groupedEvents).map(([tutorId, sessions]) => {
      const tutor = tutors.find(t => t.tutor_id === parseInt(tutorId));
      const tutorName = tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Unknown Tutor';

      return sessions.map(session => {
        const start = new Date(session.session_datetime);
        const end = new Date(start.getTime() + session.duration * 60 * 1000);
        
        return {
          id: session.session_id,
          text: tutorName,
          start: start,
          end: end,
          backColor: intToHexSpread(tutorId)
        };
      });
    }).flat();

    setEvents(events);
  }, [filteredData, tutors]);

  if (homeworkListLoading || studentsLoading || tutorsLoading || tutoringSessionLoading || !filteredData) {
    return <div>Loading...</div>;
  }
  if (homeworkListError || studentsError || tutorsError || tutoringSessionError) {
    if ([homeworkListError, studentsError, tutorsError, tutoringSessionError].some(err => err?.status === 401)) {
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const handleStudentChange = e => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    const filteredSessions = tutoringSessionData.filter(
      session => session.student_id === parseInt(studentId) && (!selectedTutor || session.tutor_id === parseInt(selectedTutor))
    );
    setFilteredData(filteredSessions);
  };

  const handleTutorChange = e => {
    const tutorId = e.target.value;
    setSelectedTutor(tutorId);
    const filteredSessions = tutoringSessionData.filter(
      session => session.tutor_id === parseInt(tutorId) && (!selectedStudent || session.student_id === parseInt(selectedStudent))
    );
    setFilteredData(filteredSessions);
  };

  return (
    <div className="App">
      <div style={styles.wrap}>
        <div style={styles.main}>
          <DayPilotCalendar
            viewType="Day"
            {...config}
            events={events}
            startDate={startDate}
            controlRef={setCalendar}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleDaily;
