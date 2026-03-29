import "../styles/profile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getRatingTrends } from "../services/api";

export default function Profile() {
  const profile = JSON.parse(localStorage.getItem("profile")) || {};
  const navigate = useNavigate();

  const [questionsAsked, setQuestionsAsked] = useState(null);
  const [statsError, setStatsError] = useState(false);

  const [ratingData, setRatingData] = useState(null);
  const [ratingError, setRatingError] = useState(false);
  const [ratingLoad, setRatingLoad] = useState(true);

  /* ── fetch question count ── */
  useEffect(() => {
    api.get("/stats")
      .then((res) => setQuestionsAsked(res.data.questions_asked))
      .catch(() => { setStatsError(true); setQuestionsAsked(0); });
  }, []);

  /* ── fetch rating trends ── */
  useEffect(() => {
    setRatingLoad(true);
    getRatingTrends()
      .then((data) => setRatingData(data))
      .catch(() => setRatingError(true))
      .finally(() => setRatingLoad(false));
  }, []);

  /* ── derived stats ── */
  const totalFeedback = ratingData?.counts?.reduce((a, b) => a + b, 0) ?? 0;
  const overallAvg = ratingData?.averages?.length
    ? (ratingData.averages.reduce((a, b) => a + b, 0) / ratingData.averages.length).toFixed(1)
    : null;

  return (
    <div className="profile-page">

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate("/assistant", { state: { name: profile.name } })}
      >
        ← Back to Assistant
      </button>

      {/* PROFILE CARD */}
      <div className="profile-card-main">
        <div className="profile-header">
          <div className="avatar">👤</div>
          <div className="profile-info">
            <h2>{profile.name || "Teacher"}</h2>
            <p>{profile.experience}</p>
          </div>
          <button className="edit-btn">✏️ Edit Profile</button>
        </div>

        <div className="profile-grid">
          <div>
            <h4>📘 Subjects</h4>
            <span className="pill">{profile.subjects}</span>
          </div>
          <div>
            <h4>📍 Location</h4>
            <p>{profile.location}</p>
          </div>
        </div>

        <div className="challenges">
          <h4>🧠 Main Challenges</h4>
          <p>{profile.challenges}</p>
        </div>
      </div>

      {/* IMPACT */}
      <div className="impact-card">
        <h3>📈 Your Impact</h3>
        <p className="muted">Track how TeachAssist is helping you grow</p>

        <div className="impact-grid">

          <div className="impact-box blue">
            <strong>
              {questionsAsked === null
                ? <span className="stat-loading">…</span>
                : questionsAsked}
            </strong>
            <span>Questions Asked</span>
          </div>

          <div className="impact-box green">
            <strong>
              {ratingLoad
                ? <span className="stat-loading">…</span>
                : totalFeedback}
            </strong>
            <span>Feedback Given</span>
          </div>

          <div className="impact-box yellow">
            <strong>
              {ratingLoad
                ? <span className="stat-loading">…</span>
                : overallAvg
                  ? `${overallAvg}/5`
                  : "—"}
            </strong>
            <span>Avg. Satisfaction</span>
          </div>

        </div>

        {(statsError || ratingError) && (
          <p className="stat-error">Could not load live stats. Showing cached data.</p>
        )}
      </div>

    </div>
  );
}