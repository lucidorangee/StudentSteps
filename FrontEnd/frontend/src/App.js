import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Logout from './pages/Logout.js';
import Register from './pages/Register.js';
import ManageUsers from './pages/ManageUsers.js';
import ManageTutoringSessions from './pages/ManageTutoringSessions.js';
import Layout from './pages/Layout.js';
import ScheduleList from './pages/ScheduleList.js';
import CreateTutoringSession from './pages/CreateTutoringSession.js';
import CreateStudent from './pages/CreateStudent.js';
import CreateTutor from './pages/CreateTutor.js';
import CreateHomework from './pages/CreateHomework.js';
import ManageComments from './pages/ManageComments.js';
import ManageStudents from './pages/ManageStudents.js';
import ManageHomework from './pages/ManageHomework.js';
import ManageDueHomework from './pages/ManageDueHomework.js';
import ManageTutors from './pages/ManageTutors.js';
import ManageRoles from './pages/ManageRoles.js';
import StudentDetail from './pages/StudentDetail.js';
import ScheduleCalendar from './pages/ScheduleCalendar.js';
import WeeklyCalendar from './pages/WeeklyCalendar.js';
import TutorDetail from './pages/TutorDetail.js';


function App() {  
  return (
    <Router>
      <div className="mainbody">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute element={Home} />}  />
          <Route path="/tutoringsessions" element={<ProtectedRoute element={ManageTutoringSessions} />} />

          <Route path="/admin/users" element={<ProtectedRoute element={ManageUsers} />} />
          <Route path="/admin/tutors" element={<ProtectedRoute element={ManageTutors} />} />
          <Route path="/admin/students" element={<ProtectedRoute element={ManageStudents} />} />
          <Route path="/admin/roles" element={<ProtectedRoute element={ManageRoles} />} />
          <Route path="/admin/homework" element={<ProtectedRoute element={ManageHomework} />} />

          <Route path="/schedule/list/:date?" element={<ProtectedRoute element={ScheduleList} />} />
          <Route path="/schedule/weekly/:date?" element={<ProtectedRoute element={WeeklyCalendar} />} />
          <Route path="/schedule/calendar/:date?" element={<ProtectedRoute element={ScheduleCalendar} />} />
          <Route path="/schedule/create" element={<ProtectedRoute element={CreateTutoringSession} />} />

          <Route path="/homework/create" element={<ProtectedRoute element={CreateHomework} />} />
          <Route path="/admin/homework/due" element={<ProtectedRoute element={ManageDueHomework} />} />

          <Route path="/students/create" element={<ProtectedRoute element={CreateStudent} />} />
          <Route path="/students/detail/:id" element={<ProtectedRoute element={StudentDetail} />} />
          

          <Route path="/tutors/create" element={<ProtectedRoute element={CreateTutor} />} />
          <Route path="/tutors/detail/:id" element={<ProtectedRoute element={TutorDetail} />} />

          <Route path="/comments" element={<ProtectedRoute element={ManageComments} />} />
        </Route>
      </Routes>
      </div>
    </Router>
  );
}

export default App;