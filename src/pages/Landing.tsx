import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const Landing = () => {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <section className="flex flex-col items-center justify-center text-center px-8 py-24">

        <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
          Learn Smarter,
          <br />
          <span className="text-indigo-600">
            Not Harder.
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-xl text-gray-600 leading-9">
          LearnFlow AI creates personalized STEM learning
          journeys based on your strengths, weaknesses,
          confidence and learning pace.
        </p>

        <div className="mt-12 w-72">
          <PrimaryButton
            text="Start Learning"
            onClick={() => navigate("/login")}
          />
        </div>

      </section>

      <section className="grid grid-cols-3 gap-8 px-16 pb-20">

        <div className="rounded-2xl bg-white shadow-md p-8">

          <h2 className="font-bold text-2xl mb-4">
            🎯 Personalized Learning
          </h2>

          <p className="text-gray-600">
            AI first understands your current
            knowledge before teaching.
          </p>

        </div>

        <div className="rounded-2xl bg-white shadow-md p-8">

          <h2 className="font-bold text-2xl mb-4">
            📚 Micro Lessons
          </h2>

          <p className="text-gray-600">
            Learn through short, interactive,
            easy-to-understand lessons.
          </p>

        </div>

        <div className="rounded-2xl bg-white shadow-md p-8">

          <h2 className="font-bold text-2xl mb-4">
            🤖 AI Mentor
          </h2>

          <p className="text-gray-600">
            Receive personalized guidance,
            hints and recommendations in
            real time.
          </p>

        </div>

      </section>

    </div>
  );
};

export default Landing;