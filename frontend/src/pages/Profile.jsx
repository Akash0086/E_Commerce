import { useEffect, useState } from "react";
import api from "../services/api.js";
import "../styles/Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/users/profile");

        const user = res.data?.user || res.data;

        const details = {
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        };

        setProfile(details);
        setForm({
          name: details.name,
          phone: details.phone,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your account details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await api.put("/users/profile", {
        name,
        phone,
      });

      const updatedUser = res.data?.user || res.data;

      setProfile((current) => ({
        ...current,
        name: updatedUser.name ?? name,
        phone: updatedUser.phone ?? phone,
      }));

      setForm({
        name: updatedUser.name ?? name,
        phone: updatedUser.phone ?? phone,
      });

      setSuccess("Your account details have been updated.");
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    form.name.trim() !== profile.name ||
    form.phone.trim() !== profile.phone;

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <span className="profile-spinner" />
          <p>Loading account details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">YOUR ACCOUNT</p>
            <h1>Account Details</h1>
            <p className="profile-subtitle">
              Manage your personal information and contact details.
            </p>
          </div>
        </header>

        {error && (
          <div className="profile-alert profile-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div
            className="profile-alert profile-alert-success"
            role="status"
          >
            {success}
          </div>
        )}

        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar" aria-hidden="true">
              {profile.name
                ? profile.name.trim().charAt(0).toUpperCase()
                : "U"}
            </div>

            <div>
              <h2>{profile.name || "Your Account"}</h2>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className="profile-divider" />

          <form onSubmit={handleSubmit}>
            <div className="profile-section-heading">
              <h3>Personal Information</h3>
              <p>Update the details associated with your account.</p>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  autoComplete="email"
                />
                <span className="profile-field-hint">
                  Contact support if you need to change your email.
                </span>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="profile-form-footer">
              <button
                type="button"
                className="profile-reset-button"
                disabled={saving || !hasChanges}
                onClick={() => {
                  setForm({
                    name: profile.name,
                    phone: profile.phone,
                  });
                  setError("");
                  setSuccess("");
                }}
              >
                Discard Changes
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving || !hasChanges}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        <section className="profile-info-card">
          <div className="profile-info-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M8 10V7a4 4 0 0 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h3>Your information is protected</h3>
            <p>
              Keep your contact details up to date so you can receive
              important information about your orders.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;