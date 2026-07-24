import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { CheckCircle, AlertTriangle, Brain } from "lucide-react";

export default function LearningProfile() {

  const location = useLocation();
  const navigate = useNavigate();

  const topic = location.state.topic;

  const [profile,setProfile]=useState<any>(null);

  useEffect(()=>{

  load();

  },[]);

  async function load(){

  const token=localStorage.getItem("token");

  const response=await fetch(
  "http://localhost:5000/api/progress",
  {
  headers:{
  Authorization:`Bearer ${token}`
  }
  });

  const data=await response.json();

  const current=data.find((p:any)=>p.topic===topic);

  setProfile(current);

  }

  if (!state) {
    return <div>No learning profile found.</div>;
  }

  const {
    topic,
    mastery,
    strong,
    average,
    weak,
    roadmap,
    startConcept,
    estimatedTime,
  } = state;

  if (!state) {
    return <div>No learning profile found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="max-w-6xl mx-auto p-8">

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="flex items-center gap-3">

            <Brain className="text-indigo-600" size={34}/>

            <h1 className="text-3xl font-bold">
              Your Learning Profile
            </h1>

          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">

            <div className="bg-indigo-50 rounded-xl p-6">

              <p className="text-gray-500">
                Mastery
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {mastery}%
              </h2>

            </div>

            <div className="bg-green-50 rounded-xl p-6">

              <p className="text-gray-500">
                Strong Concepts
              </p>

              <div className="mt-3 space-y-2">

                {strong.map((item:string)=>(
                  <div className="flex gap-2">
                    <CheckCircle
                      size={18}
                      className="text-green-600"
                    />
                    {item}
                  </div>
                ))}

              </div>

            </div>

            <div className="bg-red-50 rounded-xl p-6">

              <p className="text-gray-500">
                Weak Concepts
              </p>

              <div className="mt-3 space-y-2">

                {weak.map((item:string)=>(
                  <div className="flex gap-2">
                    <AlertTriangle
                      size={18}
                      className="text-red-600"
                    />
                    {item}
                  </div>
                ))}

              </div>

            </div>

          </div>

          <div className="mt-8 bg-yellow-50 rounded-xl p-6">

            <h2 className="font-bold text-xl">
              <div className="mt-8 bg-indigo-50 rounded-xl p-6">

              <h2 className="font-bold text-2xl">

              AI Recommendation

              </h2>

              <p className="mt-4">

              Based on your diagnostic assessment,

              your weakest concept is

              <strong>

              {startConcept}

              </strong>

              </p>

              <p className="mt-3">

              Estimated learning time

              <strong>

              {estimatedTime}

              </strong>

              </p>

              </div>
                          </h2>

            <p className="mt-3">

              Start learning from

              <span className="font-bold text-indigo-600">

                {" "}
                {startConcept}

              </span>

            </p>

          </div>
          
          <div className="bg-yellow-50 rounded-xl p-6">

            <p className="text-gray-500">

              Average Concepts

            </p>

            <div className="mt-3 space-y-2">

              {average.map((item:string)=>(

                <div
                key={item}
                className="flex gap-2"
                >

                  <Brain
                  size={18}
                  className="text-yellow-600"
                  />

                  {item}

                </div>

              ))}

            </div>

          </div>
          
          <div className="mt-8 max-w-sm">

            <PrimaryButton
              text="Start Personalized Learning"
              onClick={()=>
              navigate("/lesson",{

              state:{

              topic,

              roadmap,

              concept:startConcept,

              mastery,

              strong,

              average,

              weak

              }

              })
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}