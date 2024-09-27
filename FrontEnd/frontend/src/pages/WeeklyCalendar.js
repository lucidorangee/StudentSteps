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


const WeeklyCalendar = () => {
  const queryClient = useQueryClient();

  const { date } = useParams();
  //const [homeworkList, setHomeworkList] = useState([]);
  //const [students, setStudents] = useState([]);
  //const [tutors, setTutors] = useState([]);
  //const [tutoringSessionData, setTutoringSessionData] = useState([]);
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
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({queryKey: ['tutors'], queryFn: () => fetchTutors()});

  const {
    data: homeworkList,
    isLoading: homeworkListLoading,
    error: homeworkListError,
  } = useQuery({queryKey: ['homework'], queryFn: () => fetchHomework()});

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionLoading,
    error: tutoringSessionError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  useEffect(() => {
    setFilteredData(tutoringSessionData);
  }, [tutoringSessionData]);

  

  const config = {
    viewType: "Week",
    durationBarVisible: true,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async args => {
      const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      calendar.clearSelection();
      if (!modal.result) { return; }
      calendar.events.add({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: modal.result
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
          text: "-"
        },
        {
          text: "Edit...",
          onClick: async args => {
            await editEvent(args.source);
          }
        }
      ]
    }),
    onBeforeEventRender: args => {
      args.data.areas = [
        {
          top: 3,
          right: 3,
          width: 20,
          height: 20,
          symbol: "icons/daypilot.svg#minichevron-down-2",
          fontColor: "#fff",
          toolTip: "Show context menu",
          action: "ContextMenu",
        },
        {
          top: 3,
          right: 25,
          width: 20,
          height: 20,
          symbol: "icons/daypilot.svg#x-circle",
          fontColor: "#fff",
          action: "None",
          toolTip: "Delete event",
          onClick: async args => {
            calendar.events.remove(args.source);
          }
        }
      ];

      /*
      const participants = args.data.participants;
      if (participants > 0) {
        // show one icon for each participant
        for (let i = 0; i < participants; i++) {
          args.data.areas.push({
            bottom: 5,
            right: 5 + i * 30,
            width: 24,
            height: 24,
            action: "None",
            image: `https://picsum.photos/24/24?random=${i}`,
            style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
          });
        }
      }*/
    }
  };

  const editEvent = async (e) => {
    const modal = await DayPilot.Modal.prompt("Update event text:", e.text());
    if (!modal.result) { return; }
    e.data.text = modal.result;
    calendar.events.update(e);
  };

  function intToHexSpread(integer) {
    const MAX_HEX_VALUE = 0xFFFFFF;

    let scrambledInt = integer ^ 0xABCDEF; 
    
    scrambledInt = (scrambledInt << 3) ^ (scrambledInt >> 5);
  
    let hexValue = Math.abs(scrambledInt % (MAX_HEX_VALUE + 1));
    
    return hexValue.toString(16).padStart(6, '0').toUpperCase();
  }
/*
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeworkResponse, studentResponse, tutorResponse, tutoringSessionResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
            credentials: 'include'
          }),
        ]);
  
        if (!homeworkResponse.ok || !studentResponse.ok || !tutorResponse.ok || !tutoringSessionResponse.ok) throw new Error('One or more fetch requests failed');
  
        const homeworkData = await homeworkResponse.json();
        const studentData = await studentResponse.json();
        const tutorData = await tutorResponse.json();
        const tutoringSessionData = await tutoringSessionResponse.json();
  
        setHomeworkList(homeworkData);
        setStudents(studentData);
        setTutors(tutorData);
        setTutoringSessionData(tutoringSessionData);
        setFilteredData(tutoringSessionData);
      } catch (error) {
        console.error("Error fetching homework, students, or schedule data: ", error);
      }
    };
  
    fetchData();
  }, []);*/

  useEffect(() => {

    const events = filteredData.map(item => {
      const start = new Date(item.session_datetime);
      const end = new Date(start.getTime() + item.duration * 60 * 1000);

      const tutor = tutors.find(t => t.tutor_id === item.tutor_id);
      const tutorName = tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Unknown Tutor';
      
      return {
        id: item.session_id,
        text: tutorName,
        start: start,
        end: end,
        backColor: intToHexSpread(item.tutor_id)
      };
    });

    setEvents(events);
  }, [filteredData]);

  if (homeworkListLoading || studentsLoading || tutorsLoading || tutoringSessionLoading) return <div>Loading...</div>;
  if (homeworkListError || studentsError || tutorsError || tutoringSessionError){
    if(homeworkListError?.status === 401 || studentsError?.status === 401 || tutorsError?.status === 401 || tutoringSessionError?.status === 401)
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
    
  }

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);

    const filteredSessions = tutoringSessionData.filter(session => (session.student_id === parseInt(studentId) && (selectedTutor === null? true : session.tutorId === parseInt(selectedTutor))));
    setFilteredData(filteredSessions);
  };

  const handleTutorChange = (e) => {
    const tutorId = e.target.value;
    setSelectedTutor(tutorId);

    const filteredSessions = tutoringSessionData.filter(session => session.tutor_id === parseInt(tutorId) && (selectedTutor === null? true : session.tutorId === parseInt(selectedTutor)));
    setFilteredData(filteredSessions);
  };

  return (
    
    <div className="App">
      {/* Dropdown to select student */}
      <row>
        <div className="col-6">
          <select value={selectedStudent || ""} onChange={handleStudentChange} className="form-select mb-3">
          <option value="" disabled>Select a Student</option>
          {students.map(student => (
            <option key={student.student_id} value={student.student_id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
          </select>
        </div>
        <div className="col-6">
          <select value={selectedTutor || ""} onChange={handleTutorChange} className="form-select mb-3">
          <option value="" disabled>Select a Tutor</option>
          {tutors.map(tutor => (
            <option key={tutor.tutor_id} value={tutor.tutor_id}>
              {tutor.first_name} {tutor.last_name}
            </option>
          ))}
          </select>
        </div>
      </row>
      
      <div style={styles.wrap}>
        <div style={styles.left}>
          <DayPilotNavigator
            selectMode={"Week"}
            showMonths={3}
            skipMonths={3}
            selectionDay={startDate}
            onTimeRangeSelected={ args => {
              setStartDate(args.day);
            }}
          />
        </div>
        <div style={styles.main}>
          <DayPilotCalendar
            {...config}
            events={events}
            startDate={startDate}
            controlRef={setCalendar}
          />
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalendar;