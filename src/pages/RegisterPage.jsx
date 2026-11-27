import { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PasswordField } from '../components/PasswordField';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import { getStoredUtmParams } from '../utils/utm';
import './AuthPages.css';

export function RegisterPage() {
  const { registerUser } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const utmParams = useMemo(() => getStoredUtmParams(), []);
  const hasUtm = Boolean(utmParams.utm_source || utmParams.utm_medium || utmParams.utm_campaign);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    graduationYear: '2027',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const refs = {
    name: useRef(null),
    email: useRef(null),
    graduationYear: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  const validate = () => {
    const nextErrors = {};
    if (formData.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid university or alumni email address.';
    }
    if (!/^\d{4}$/.test(formData.graduationYear.trim())) {
      nextErrors.graduationYear = 'Enter a 4-digit graduation year (e.g. 2027).';
    }
    if (formData.password.length < 8) {
      nextErrors.password = 'Choose a password with at least 8 characters.';
    }
    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    const keys = Object.keys(validationErrors);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (refs[firstKey]?.current) {
        refs[firstKey].current.focus();
      }
      showToast({
        type: 'error',
        title: 'Registration incomplete',
        message: 'Review the highlighted fields before creating your account.',
      });
      return;
    }

    const latestUtm = getStoredUtmParams();
    const registrationRequestPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      graduationYear: formData.graduationYear.trim(),
      utm: latestUtm,
    };

    registerUser(registrationRequestPayload);
    showToast({
      type: 'success',
      title: 'Registration successful',
      message: `Account created for ${registrationRequestPayload.name}.`,
    });
    navigate('/');
  };

  const errorEntries = Object.entries(errors);

  return (
    <section className="page-section">
      <PageMeta
        title="Register"
        description="Create your University Connect student or alumni account to join campus communities and publish builds."
      />
      <div className="container auth-container">
        <div className="card auth-card">
          <div className="page-header">
            <h1 className="page-title">Join University Connect</h1>
            <p className="page-subtitle">
              Set up your campus profile to connect with alumni mentors, student clubs, and
              hackathon teammates.
            </p>
          </div>

          {hasUtm && (
            <div className="utm-notice" role="note">
              <strong>Referral Attribution Captured:</strong>{' '}
              {[
                utmParams.utm_source && `source=${utmParams.utm_source}`,
                utmParams.utm_medium && `medium=${utmParams.utm_medium}`,
                utmParams.utm_campaign && `campaign=${utmParams.utm_campaign}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit} noValidate>
                {errorEntries.length > 0 && (
                  <div className="error-summary" role="alert">
                    <h3>Please fix {errorEntries.length} registration error(s):</h3>
                    <ul>
                      {errorEntries.map(([field, msg]) => (
                        <li key={field}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="reg-name" className="form-label">
                    Full Name
                  </label>
                  <input
                    ref={refs.name}
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    className={`form-input ${errors.name ? 'input-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'reg-name-err' : undefined}
                    placeholder="Anika Deshmukh"
                  />
                  {errors.name && (
                    <span id="reg-name-err" className="field-error">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="reg-email" className="form-label">
                    University or Alumni Email
                  </label>
                  <input
                    ref={refs.email}
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className={`form-input ${errors.email ? 'input-invalid' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'reg-email-err' : undefined}
                    placeholder="anika.deshmukh@universityconnect.edu.in"
                  />
                  {errors.email && (
                    <span id="reg-email-err" className="field-error">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="two-col-grid">
                  <div className="form-field">
                    <label htmlFor="reg-role" className="form-label">
                      Membership Type
                    </label>
                    <select
                      id="reg-role"
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="student">Current Student</option>
                      <option value="alumni">Alumni Mentor</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="reg-grad-year" className="form-label">
                      Graduation Year
                    </label>
                    <input
                      ref={refs.graduationYear}
                      id="reg-grad-year"
                      type="text"
                      inputMode="numeric"
                      className={`form-input ${errors.graduationYear ? 'input-invalid' : ''}`}
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      aria-invalid={Boolean(errors.graduationYear)}
                      aria-describedby={errors.graduationYear ? 'reg-year-err' : undefined}
                      placeholder="2027"
                    />
                    {errors.graduationYear && (
                      <span id="reg-year-err" className="field-error">
                        {errors.graduationYear}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="reg-dept" className="form-label">
                    Department
                  </label>
                  <select
                    id="reg-dept"
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Computer Science & Engineering">
                      Computer Science &amp; Engineering
                    </option>
                    <option value="Electronics & Communication">
                      Electronics &amp; Communication
                    </option>
                    <option value="Artificial Intelligence & Data Science">
                      Artificial Intelligence &amp; Data Science
                    </option>
                    <option value="Design & Human-Computer Interaction">
                      Design &amp; Human-Computer Interaction
                    </option>
                  </select>
                </div>

                <PasswordField
                  ref={refs.password}
                  id="reg-password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                />

                <PasswordField
                  ref={refs.confirmPassword}
                  id="reg-confirm-password"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                />

                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </form>

              <p className="auth-switch-link">
                Already registered? <Link to="/login">Sign in to your account</Link>
              </p>
        </div>
      </div>
    </section>
  );
}
