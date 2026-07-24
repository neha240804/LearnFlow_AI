import { useEffect, useState } from "react";

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
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
                className="bg-white rounded-xl shadow p-6 mb-5"
              >
                <div className="flex justify-between">

                  <div>

                    <h3 className="text-xl font-bold">
                      {item.topic}
                    </h3>

                    <p className="text-gray-500">
                      {item.subject}
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-white ${
                      item.completed
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {item.completed ? "Completed" : "In Progress"}
                  </span>

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