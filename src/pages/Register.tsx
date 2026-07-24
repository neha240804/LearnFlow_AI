import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleRegister() {
        setError("");

        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        if (!password.trim()) {
            setError("Please enter a password");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            alert("Registration successful!");

            navigate("/login");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">

            <div className="bg-white shadow-xl rounded-3xl w-full max-w-md p-10">

                <h1 className="text-4xl font-bold text-center">
                    Create Account 🚀
                </h1>

                <p className="text-center text-gray-500 mt-3">
                    Join LearnFlow AI and start your personalized STEM journey.
                </p>

                <div className="mt-8">
                    <label className="font-semibold">Full Name</label>

                    <input
                        className="mt-2 border rounded-xl w-full p-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                <div className="mt-5">
                    <label className="font-semibold">Email</label>

                    <input
                        className="mt-2 border rounded-xl w-full p-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@learnflow.ai"
                    />
                </div>

                <div className="mt-5">
                    <label className="font-semibold">Password</label>

                    <input
                        type="password"
                        className="mt-2 border rounded-xl w-full p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                    />
                </div>

                <div className="mt-5">
                    <label className="font-semibold">Confirm Password</label>

                    <input
                        type="password"
                        className="mt-2 border rounded-xl w-full p-3"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                    />
                </div>

                {error && (
                    <p className="text-red-500 mt-4">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

                <p className="text-center mt-6 text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}