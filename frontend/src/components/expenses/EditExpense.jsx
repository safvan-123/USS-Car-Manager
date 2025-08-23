import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditExpense = () => {
  const { id } = useParams(); // expenseId from URL
  const [cars, setCars] = useState([]);
  const [car, setCar] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get cars
        const carRes = await axios.get(
          "https://uss-car-manager-f0gv.onrender.com/api/cars"
        );
        setCars(carRes.data);

        // Get expense details
        const expRes = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`
        );
        const exp = expRes.data;

        setCar(exp.car?._id || "");
        setDate(exp.date ? exp.date.substring(0, 10) : "");
        if (
          ["Fuel", "Service", "Insurance", "Tax", "Others"].includes(
            exp.category
          )
        ) {
          setCategory(exp.category);
        } else {
          setCategory("Others");
          setCustomCategory(exp.category);
        }
        setAmount(exp.amount || "");
        setNotes(exp.notes || "");
      } catch (err) {
        console.error("Error fetching expense:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalCategory = category === "Others" ? customCategory : category;

    try {
      await axios.put(
        `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`,
        {
          car,
          date,
          category: finalCategory,
          amount,
          notes,
        }
      );

      navigate(`/expenses/${car}`);
    } catch (err) {
      console.error("Error updating expense:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Loading expense details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0 rounded-3 p-4">
        <h3 className="mb-3 text-center fw-bold text-primary">
          ✏️ Edit Expense
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Car */}
          <div className="mb-3">
            <label>Select Car</label>
            <select
              className="form-control"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              required
            >
              <option value="">-- Select Car --</option>
              {cars.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.carName} ({c.carNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="mb-3">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="mb-3">
            <label>Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Select Category --</option>
              <option value="Fuel">Fuel</option>
              <option value="Service">Service</option>
              <option value="Insurance">Insurance</option>
              <option value="Tax">Tax</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {category === "Others" && (
            <div className="mb-3">
              <label>Specify Category</label>
              <input
                type="text"
                className="form-control"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          {/* Amount */}
          <div className="mb-3">
            <label>Amount</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label>Notes</label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              "💾 Update Expense"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
