import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Diagnostic from "./pages/Diagnostic";
import Lesson from "./pages/Lesson";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import ConceptQuiz from "./pages/ConceptQuiz";
import Profile from "./pages/Profile";
import LearningProfile from "./pages/LearningProfile";
import DocumentExplanation from "./pages/DocumentExplanation";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        <Route path="/explanation" element={<ProtectedRoute><DocumentExplanation /></ProtectedRoute>} />
        <Route path="/diagnostic" element={<ProtectedRoute><Diagnostic /></ProtectedRoute>} />
        <Route path="/learning-profile" element={<ProtectedRoute><LearningProfile /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lesson" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><ConceptQuiz /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}


export default App;