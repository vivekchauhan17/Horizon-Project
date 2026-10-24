// import { Routes, Route, Navigate } from 'react-router-dom';
// import AppLayout from './components/AppLayout.jsx';
// import Landing from './pages/Landing.jsx';
// import Dashboard from './pages/Dashboard.jsx';
// import Notes from './pages/Notes.jsx';
// import Quiz from './pages/Quiz.jsx';
// import Planner from './pages/Planner.jsx';
// import Progress from './pages/Progress.jsx';

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       <Route element={<AppLayout />}>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/notes" element={<Notes />} />
//         <Route path="/quiz" element={<Quiz />} />
//         <Route path="/planner" element={<Planner />} />
//         <Route path="/progress" element={<Progress />} />
//       </Route>
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notes from './pages/Notes.jsx';
import Quiz from './pages/Quiz.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Planner from './pages/Planner.jsx';
import Progress from './pages/Progress.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}