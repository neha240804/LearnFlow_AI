import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";
import UploadBox from "../components/UploadBox";
import PrimaryButton from "../components/PrimaryButton";
import {
  Brain,
  Target,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState("Beginner");

  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user") || localStorage.getItem("learnflow-user");
    const token = localStorage.getItem("token");

    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) setUserName(user.name);
      } catch (e) {}
    }

    if (token) {
      fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setUserName(data.name);
          if (data.xp !== undefined) setXp(data.xp);
          if (data.level) setLevel(data.level);
        })
        .catch(console.error);
    }
  }, []);

  async function handleAnalyze() {
    setError("");

    if (!topic.trim() && !selectedFile) {
      setError("Please enter a topic or upload your notes.");
      return;
    }

    try {
      setLoading(true);

      // Temporary until PDF API is completed
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze topic.");
      }

      navigate("/analysis", {
        state: data,
      });

    } catch (err) {
      console.error(err);
      setError("Unable to analyze topic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-8">

        
        ...

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h1 className="text-3xl font-bold">
            👋 Welcome back, {userName}
          </h1>

          <p className="text-gray-500 mt-2">
            Continue your personalized STEM learning.
          </p>

          <div className="flex gap-8 mt-6">

            <div>

              <p className="text-gray-500 text-sm">
                XP
              </p>

              <h2 className="text-3xl font-bold">
                {xp}
              </h2>

            </div>

            <div>

              <p className="text-gray-500 text-sm">
                Level
              </p>

              <h2 className="text-3xl font-bold">
                {level}
              </h2>

            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <TopicInput
            topic={topic}
            setTopic={setTopic}
          />

          <UploadBox
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />

        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-100 border border-red-300 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 max-w-md">

          <PrimaryButton
            text={
              loading
                ? "Analyzing..."
                : "✨ Analyze & Build Learning Path"
            }
            onClick={handleAnalyze}
            loading={loading}
          />

        </div>

        <div className="grid md:grid-cols-4 gap-5 mt-10">

          <div className="bg-white rounded-xl shadow p-5">

            <Brain
              className="text-indigo-600"
              size={30}
            />

            <h2 className="font-semibold mt-3">
              AI Analysis
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Understands your uploaded notes.
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <Target
              className="text-green-600"
              size={30}
            />

            <h2 className="font-semibold mt-3">
              Learning Gaps
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Finds concepts you need to improve.
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <BookOpen
              className="text-orange-500"
              size={30}
            />

            <h2 className="font-semibold mt-3">
              Smart Roadmap
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Creates a personalized learning sequence.
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <Sparkles
              className="text-pink-500"
              size={30}
            />

            <h2 className="font-semibold mt-3">
              Adaptive Learning
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Adjusts lessons based on your performance.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}