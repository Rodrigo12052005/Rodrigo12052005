
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PathfinderDashboard from './pages/pathfinder/PathfinderDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import LeaderDashboard from './pages/leader/LeaderDashboard';
import SettingsPage from './pages/SettingsPage';
import CreateEventPage from './pages/instructor/CreateEventPage';
import ManageEventsPage from './pages/instructor/ManageEventsPage';
import WalletPage from './pages/pathfinder/WalletPage';
import ProfilePage from './pages/ProfilePage';
import ManageTasksPage from './pages/instructor/ManageTasksPage';
import ReviewTasksPage from './pages/instructor/ReviewTasksPage';
import TasksPage from './pages/pathfinder/TasksPage';
import InstructorWalletPage from './pages/instructor/InstructorWalletPage';
import RankingPage from './pages/instructor/RankingPage';
import RankingAnalysisPage from './pages/instructor/RankingAnalysisPage';
import AdjustRankingPage from './pages/instructor/AdjustRankingPage';
import VisitsPage from './pages/instructor/VisitsPage';
import TrashPage from './pages/instructor/TrashPage';
import PathfinderListPage from './pages/instructor/PathfinderListPage';
import ManageAchievementsPage from './pages/instructor/ManageAchievementsPage';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="text-white min-h-screen bg-black">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pathfinder" element={<PathfinderDashboard />} />
            <Route path="/pathfinder/wallet" element={<WalletPage />} />
            <Route path="/pathfinder/tasks" element={<TasksPage />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/instructor/create-event" element={<CreateEventPage />} />
            <Route path="/instructor/manage-events" element={<ManageEventsPage />} />
            <Route path="/instructor/edit-event/:eventId" element={<CreateEventPage />} />
            <Route path="/instructor/manage-tasks" element={<ManageTasksPage />} />
            <Route path="/instructor/manage-achievements" element={<ManageAchievementsPage />} />
            <Route path="/instructor/review-tasks" element={<ReviewTasksPage />} />
            <Route path="/instructor/wallet" element={<InstructorWalletPage />} />
            <Route path="/instructor/ranking" element={<RankingPage />} />
            <Route path="/instructor/ranking-analysis" element={<RankingAnalysisPage />} />
            <Route path="/instructor/adjust-ranking" element={<AdjustRankingPage />} />
            <Route path="/instructor/visits" element={<VisitsPage />} />
            <Route path="/instructor/trash" element={<TrashPage />} />
            <Route path="/instructor/pathfinder-list" element={<PathfinderListPage />} />
            <Route path="/leader" element={<LeaderDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;