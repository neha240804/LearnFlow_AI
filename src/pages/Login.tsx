import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();

    const [email,setEmail] = useState("");

    const [password,setPassword] = useState("");

    const [loading,setLoading] = useState(false);

    const [error,setError] = useState("");

    async function handleLogin() {
        setError("");

        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        if (!password.trim()) {
            setError("Please enter your password");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                });

                const data = await response.json();

                if (!response.ok) {
                throw new Error(data.message || "Login failed");
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                navigate("/home");
        } catch (err) {
            console.error(err);
            setError("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
            <div className="bg-white shadow-xl rounded-3xl w-full max-w-md p-10">
                <h1 className="text-4xl font-bold text-center">
                    Welcome Back 👋
                </h1>

                <p className="text-center text-gray-500 mt-3">
                    Continue your personalized STEM learning.
                </p>

                <div className="mt-8">
                    <label className="font-semibold">
                        Email
                    </label>
                    <input
                        className="mt-2 border rounded-xl w-full p-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@learnflow.ai"
                    />
                </div>

                <div className="mt-5">
                    <label className="font-semibold">
                        Password
                    </label>
                    <input
                        type="password"
                        className="mt-2 border rounded-xl w-full p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                    />
                </div>

                {error && (
                    <p className="text-red-500 mt-4 text-sm">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center mt-6 text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}