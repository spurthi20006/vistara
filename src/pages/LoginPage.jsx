import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PasswordField } from '../components/PasswordField';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './AuthPages.css';

export function LoginPage() {
  const { loginAsRole } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleChoice, setRoleChoice] = useState('student');
  const [errors, setErrors] = useState({});
  const [signedInUser, setSignedInUser] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid university email address.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (nextErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      }
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: 'Check the highlighted login fields and try again.',
      });
      return;
    }

    const user = loginAsRole(roleChoice, email);
    setSignedInUser(user);
    showToast({
      type: 'success',
      title: 'Welcome back',
      message: `Signed in as ${user.name} (${user.roleLabel}).`,
    });
  };

  const handleQuickRole = (roleKey, presetEmail) => {
    const user = loginAsRole(roleKey, presetEmail);
    setSignedInUser(user);
    setErrors({});
    showToast({
      type: 'success',
      title: 'Role session switched',
      message: `Now signed in as ${user.name} (${user.roleLabel}).`,
    });
  };

  const errorEntries = Object.entries(errors);

  return (
    <section className="page-section">
      <PageMeta
        title="Member Login"
        description="Sign in to University Connect as a student, alumni mentor, or campus coordinator."
      />
      <div className="container auth-container">
        <div className="card auth-card">
          <div className="page-header">
            <h1 className="page-title">Member Login</h1>
            <p className="page-subtitle">
              Access your profile, manage community memberships, and collaborate on campus builds.
            </p>
          </div>

          {signedInUser ? (
            <div className="form-success-card" role="status">
              <h2>Signed In Successfully</h2>
              <p>
                Welcome back, <strong>{signedInUser.name}</strong> ({signedInUser.roleLabel}).
                Your navigation menu now reflects your active account role.
              </p>
              <div className="card-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/profile')}
                >
                  Continue to My Profile
                </button>
                <Link to="/hackathons" className="btn btn-outline">
                  Go to Hackathons
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form className="form-stack" onSubmit={handleSubmit} noValidate>
                {errorEntries.length > 0 && (
                  <div className="error-summary" role="alert">
                    <h3>Unable to sign in ({errorEntries.length} error(s)):</h3>
                    <ul>
                      {errorEntries.map(([field, msg]) => (
                        <li key={field}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="login-role" className="form-label">
                    Account Role
                  </label>
                  <select
                    id="login-role"
                    className="form-select"
                    value={roleChoice}
                    onChange={(e) => setRoleChoice(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni Mentor</option>
                    <option value="coordinator">Campus Coordinator</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="login-email" className="form-label">
                    University Email
                  </label>
                  <input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={`form-input ${errors.email ? 'input-invalid' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-err' : undefined}
                    placeholder="kabir.sharma@universityconnect.edu.in"
                  />
                  {errors.email && (
                    <span id="login-email-err" className="field-error">
                      {errors.email}
                    </span>
                  )}
                </div>

                <PasswordField
                  ref={passwordRef}
                  id="login-password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                  placeholder="Enter your account password"
                />

                <button type="submit" className="btn btn-primary">
                  Sign In
                </button>
              </form>

              <div className="role-presets">
                <p className="role-presets-title">Quick Campus Role Switch:</p>
                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      handleQuickRole('student', 'kabir.sharma@universityconnect.edu.in')
                    }
                  >
                    Student Session
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      handleQuickRole('alumni', 'aarav.mehta@universityconnect.edu.in')
                    }
                  >
                    Alumni Session
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      handleQuickRole('coordinator', 'kavita.rao@universityconnect.edu.in')
                    }
                  >
                    Coordinator Session
                  </button>
                </div>
              </div>

              <p className="auth-switch-link">
                New to campus? <Link to="/register">Create a University Connect account</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
