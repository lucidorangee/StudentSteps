import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRouteWrapper from './ProtectedRouteWrapper.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Logout from './pages/Logout.js';
import Register from './pages/Register.js';
import ManageUsers from './pages/ManageUsers.js';
import ManageTutoringSessions from './pages/ManageTutoringSessions.js';
import Layout from './pages/Layout.js';
import CreateTutoringSession from './pages/CreateTutoringSession.js';
import RemoveTutoringSessions from './pages/RemoveTutoringSessions.js';
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
import ScheduleList from './pages/ScheduleList.js';
import ApprovalList from './pages/ApprovalList.js';
import ScheduleCalendar from './pages/ScheduleCalendar.js';
import WeeklyCalendar from './pages/WeeklyCalendar.js';
import TutorDetail from './pages/TutorDetail.js';
import ScheduleDaily from './pages/ScheduleDaily.js';

import AnalysisPage from './pages/AnalysisPage.js';
import EdCoordinator from './pages/EdCoordinator.js';

function App() {  
  return (
    <Router>
      <div className="mainbody">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRouteWrapper element={Home} />}  />
          <Route path="/tutoringsessions" element={<ProtectedRouteWrapper element={ManageTutoringSessions} />} />
          <Route path="/tutoringsessions/remove" element={<ProtectedRouteWrapper element={RemoveTutoringSessions} />} />

          
          <Route path="/edcoordinator" element={<ProtectedRouteWrapper element={EdCoordinator} />} />
          
          <Route path="/admin/analysis/:date?" element={<ProtectedRouteWrapper element={AnalysisPage} />} />
          <Route path="/admin/users" element={<ProtectedRouteWrapper element={ManageUsers} />} />
          <Route path="/admin/tutors" element={<ProtectedRouteWrapper element={ManageTutors} />} />
          <Route path="/admin/students" element={<ProtectedRouteWrapper element={ManageStudents} />} />
          <Route path="/admin/roles" element={<ProtectedRouteWrapper element={ManageRoles} />} />
          <Route path="/admin/homework/due" element={<ProtectedRouteWrapper element={ManageDueHomework} />} />
          <Route path="/admin/homework" element={<ProtectedRouteWrapper element={ManageHomework} />} />

          <Route path="/schedule/approval" element={<ProtectedRouteWrapper element={ApprovalList} />} />
          <Route path="/schedule/list/:date?" element={<ProtectedRouteWrapper element={ScheduleList} />} />
          <Route path="/schedule/daily/:date?" element={<ProtectedRouteWrapper element={ScheduleDaily} />} />
          <Route path="/schedule/weekly/:date?" element={<ProtectedRouteWrapper element={WeeklyCalendar} />} />
          <Route path="/schedule/calendar/:date?" element={<ProtectedRouteWrapper element={ScheduleCalendar} />} />
          <Route path="/schedule/create" element={<ProtectedRouteWrapper element={CreateTutoringSession} />} />

          <Route path="/homework/create" element={<ProtectedRouteWrapper element={CreateHomework} />} />
          

          <Route path="/students/create" element={<ProtectedRouteWrapper element={CreateStudent} />} />
          <Route path="/students/detail/:id" element={<ProtectedRouteWrapper element={StudentDetail} />} />
          

          <Route path="/tutors/create" element={<ProtectedRouteWrapper element={CreateTutor} />} />
          <Route path="/tutors/detail/:id" element={<ProtectedRouteWrapper element={TutorDetail} />} />

          <Route path="/comments" element={<ProtectedRouteWrapper element={ManageComments} />} />
        </Route>
      </Routes>
      </div>
    </Router>
  );
}

export default App;