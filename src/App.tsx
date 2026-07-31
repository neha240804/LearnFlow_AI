import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Diagnostic from "./pages/Diagnostic";
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Recommendation from "./pages/Recommendation";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import ConceptQuiz from "./pages/ConceptQuiz";
import Profile from "./pages/Profile";
import LearningProfile from "./pages/LearningProfile";
import DocumentExplanation from "./pages/DocumentExplanation";

function App() {
  return (
    <Routes>
      <ScrollToTop />
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Flow */}
      <Route path="/home" element={<Home />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/explanation" element={<DocumentExplanation />} />
      <Route path="/diagnostic" element={<Diagnostic />} />
      <Route path="/learning-profile" element={<LearningProfile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/lesson" element={<Lesson />} />
      <Route path="/quiz" element={<ConceptQuiz />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/recommendation" element={<Recommendation />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Invalid Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;