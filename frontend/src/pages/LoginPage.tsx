import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid credentials. Try seeded credentials from README.");
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <img src="/Mask%20group.avif" alt="HRMS logo" className="login-logo" />
        </div>

        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@company.com"
            required
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        <button className="button" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
