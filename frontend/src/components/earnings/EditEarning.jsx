import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditEarning() {
  const navigate = useNavigate();
  const { id, carId } = useParams(); // 👈 id = earningId, carId = car
  const [earning, setEarning] = useState({
    car: carId,
    date: "",
    source: "",
    amount: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing earning
  useEffect(() => {
    const fetchEarning = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/earnings/${id}`
        );
        setEarning({
          car: data.car?._id || carId,
          date: data.date ? data.date.split("T")[0] : "",
          source: data.source,
          amount: data.amount,
          notes: data.notes || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load earning details");
      } finally {
        setLoading(false);
      }
    };
    fetchEarning();
  }, [id, carId]);

  const handleChange = (e) => {
    setEarning({ ...earning, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/earnings/${id}`, earning);
      navigate(`/earnings/${carId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update earning");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">Loading earning details...</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Header */}
      <div
        className="card shadow-lg border-0 text-center text-white mb-4"
        style={{
          background: "linear-gradient(135deg, #00b09b, #96c93d)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-cash-stack me-2"></i>Edit Earning
          </h2>
          <p className="opacity-75">Update your vehicle’s income record</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="card shadow-sm border-0 p-4"
        style={{ borderRadius: "18px" }}
      >
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            className="form-control rounded-pill"
            value={earning.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Source</label>
          <select
            name="source"
            className="form-select rounded-pill"
            value={earning.source}
            onChange={handleChange}
            required
          >
            <option value="">Select Source</option>
            <option value="trip">Trip</option>
            <option value="rent">Rent</option>
            <option value="bonus">Bonus</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            className="form-control rounded-pill"
            value={earning.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            className="form-control rounded"
            rows="3"
            value={earning.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-success w-100 rounded-pill shadow-sm"
        >
          {saving ? "Updating..." : "Update Earning"}
        </button>
      </form>
    </div>
  );
}
