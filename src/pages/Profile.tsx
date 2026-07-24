import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RotateCcw } from "lucide-react";

type Progress = {
  id: string;
  subject: string;
  topic: string;
  confidence: number;
  mastery: number;
  completed: boolean;
  weakConcepts: string[];
  strongConcepts: string[];
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  completedTopics: number;
  averageConfidence: number;
  progress: Progress[];
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisitingTopic, setRevisitingTopic] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleRevisit(topicName: string) {
    try {
      setRevisitingTopic(topicName);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicName }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/analysis", { state: data });
      } else {
        navigate("/learning-profile", { state: { topic: topicName } });
      }
    } catch (err) {
      console.error("Failed to revisit topic:", err);
      navigate("/learning-profile", { state: { topic: topicName } });
    } finally {
      setRevisitingTopic(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xl font-medium text-gray-600">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-500 font-medium">
          Unable to load profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-6">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-4xl font-bold">
            👤 {profile.name}
          </h1>

          <p className="text-gray-500 mt-2">
            {profile.email}
          </p>

          <div className="grid md:grid-cols-4 gap-6 mt-8">

            <div className="bg-indigo-50 rounded-xl p-5">
              <p className="text-gray-500">XP</p>
              <h2 className="text-3xl font-bold">
                {profile.xp}
              </h2>
            </div>

            <div className="bg-orange-50 rounded-xl p-5">
              <p className="text-gray-500">Streak</p>
              <h2 className="text-3xl font-bold">
                🔥 {profile.streak}
              </h2>
            </div>

            <div className="bg-green-50 rounded-xl p-5">
              <p className="text-gray-500">Completed Topics</p>
              <h2 className="text-3xl font-bold">
                {profile.completedTopics}
              </h2>
            </div>

            <div className="bg-blue-50 rounded-xl p-5">
              <p className="text-gray-500">Average Confidence</p>
              <h2 className="text-3xl font-bold">
                {profile.averageConfidence}%
              </h2>
            </div>

          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-3xl font-bold mb-5">
            Learning Progress
          </h2>

          {profile.progress.length === 0 ? (

            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              No progress yet.
              <br />
              Complete a diagnostic quiz or lesson to begin tracking your learning.
            </div>

          ) : (

            profile.progress.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6 mb-5 border hover:border-indigo-200 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                  <div>

                    <h3 className="text-xl font-bold">
                      {item.topic}
                    </h3>

                    <p className="text-gray-500">
                      {item.subject}
                    </p>

                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-white font-medium text-sm ${
                        item.completed
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {item.completed ? "Completed" : "In Progress"}
                    </span>

                    <button
                      onClick={() => handleRevisit(item.topic)}
                      disabled={revisitingTopic === item.topic}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                    >
                      <RotateCcw
                        size={16}
                        className={revisitingTopic === item.topic ? "animate-spin" : ""}
                      />
                      {revisitingTopic === item.topic ? "Analyzing..." : "Revisit Topic"}
                    </button>
                  </div>

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">

                  <div>
                    <p><b>Confidence:</b> {item.confidence}%</p>
                    <p><b>Mastery:</b> {item.mastery}%</p>
                  </div>

                  <div>
                    <p>
                      <b>Strong Concepts:</b>{" "}
                      {item.strongConcepts.join(", ") || "-"}
                    </p>

                    <p className="mt-2">
                      <b>Weak Concepts:</b>{" "}
                      {item.weakConcepts.join(", ") || "-"}
                    </p>
                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    </div>
  );
}