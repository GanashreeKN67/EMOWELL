import { Link } from "react-router-dom";

const AuthWall = ({
  title = "Sign in required",
  description = "Create a free account or log in to continue.",
}) => (
  <div className="auth-wall">
    <h3>{title}</h3>
    <p>{description}</p>
    <div className="auth-wall__actions">
      <Link className="btn btn--primary" to="/login">
        Log in
      </Link>
      <Link className="btn btn--outline" to="/register">
        Create account
      </Link>
    </div>
  </div>
);

export default AuthWall;
