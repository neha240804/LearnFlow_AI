import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  async function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return;

    const data = await response.json();

    setUser(data.user);
  }

  loadUser();
}, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <GraduationCap size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              LearnFlow AI
            </h1>

            <p className="text-xs text-gray-500">
              Personalized STEM Learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">

          {user && (
            <span className="text-gray-700 font-medium">
              Welcome, {user.name}
            </span>
          )}

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-lg hover:bg-gray-100"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            👤 My Profile
          </button>

        </div>

      </div>
    </nav>
  );
}