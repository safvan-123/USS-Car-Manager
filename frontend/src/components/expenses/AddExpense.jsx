import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddExpense = () => {
  const [cars, setCars] = useState([]);
  const [expense, setExpense] = useState({
    car: "",
    title: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    category: "",
    customCategory: "",
    totalAmount: "",
    notes: "",
  });
  const [partnerInputs, setPartnerInputs] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch Cars
  useEffect(() => {
    axios
      .get("https://uss-car-manager-f0gv.onrender.com/api/cars")
      .then((res) => setCars(res.data))
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  // 🔹 Fetch Partners when car is selected
  useEffect(() => {
    if (!expense.car) return;
    axios
      .get(
        `https://uss-car-manager-f0gv.onrender.com/api/partners/car/${expense.car}`
      )
      .then((res) => {
        const fetched = res.data.map((p) => ({
          partnerId: p._id,
          name: p.name,
          share: Number(p.sharePercentage) || 0,
          amount: 0,
          paid: false,
        }));
        setPartnerInputs(fetched);
      })
      .catch((err) => console.error("Error fetching partners:", err));
  }, [expense.car]);

  // 🔹 Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalAmount") {
      const total = parseFloat(value) || 0;
      setPartnerInputs((prev) =>
        prev.map((p) => {
          const payable = (total * (Number(p.share) || 0)) / 100;
          return {
            ...p,
            amount: Number.isNaN(payable) ? 0 : Math.round(payable),
          };
        })
      );
    }
    setExpense({ ...expense, [name]: value });
  };

  // 🔹 Toggle paid/unpaid
  const togglePaid = (id) => {
    setPartnerInputs((prev) =>
      prev.map((p) => (p.partnerId === id ? { ...p, paid: !p.paid } : p))
    );
  };

  // 🔹 Mark All Paid/Unpaid
  const markAllPaid = (paidStatus) => {
    setPartnerInputs((prev) => prev.map((p) => ({ ...p, paid: paidStatus })));
  };

  // 🔹 Count stats
  const paidCount = partnerInputs.filter((p) => p.paid).length;
  const totalPartners = partnerInputs.length;

  // 🔹 Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalCategory =
      expense.category === "Others" ? expense.customCategory : expense.category;

    try {
      await axios.post(
        "https://uss-car-manager-f0gv.onrender.com/api/expenses",
        {
          car: expense.car,
          title: expense.title,
          type: expense.type,
          date: expense.date,
          category: finalCategory,
          totalAmount: parseFloat(expense.totalAmount),
          notes: expense.notes,
          partners: partnerInputs.map((p) => ({
            partnerId: p.partnerId,
            amount: p.amount,
            paid: p.paid,
          })),
        }
      );
      navigate(`/expenses/${expense.car}`);
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div
        className="card shadow-lg border-0 text-center text-white mb-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-receipt me-2"></i>Add New Expense
          </h2>
          <p className="opacity-75">
            Record and track your car-related spending
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="card shadow-lg border-0 p-4">
        <div className="row g-4">
          {/* Car */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Select Car</label>
            <select
              name="car"
              className="form-select rounded-pill"
              value={expense.car}
              onChange={handleChange}
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
          <div className="col-md-6">
            <label className="form-label fw-semibold">Date</label>
            <input
              type="date"
              name="date"
              className="form-control rounded-pill"
              value={expense.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category</label>
            <select
              name="category"
              className="form-select rounded-pill"
              value={expense.category}
              onChange={handleChange}
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

          {/* Custom Category */}
          {expense.category === "Others" && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Custom Category</label>
              <input
                type="text"
                name="customCategory"
                className="form-control rounded-pill"
                value={expense.customCategory}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Total */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Total Amount (₹)</label>
            <input
              type="number"
              name="totalAmount"
              className="form-control rounded-pill"
              value={expense.totalAmount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Notes */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Notes</label>
            <input
              type="text"
              name="notes"
              className="form-control rounded-pill"
              value={expense.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 🔹 Partner Section with Enhanced UI */}
        {partnerInputs.length > 0 && (
          <div className="mt-5">
            <div className="card border-0 shadow-sm ">
              {/* Header */}
              <div className="card-header bg-light border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 py-3">
                <div>
                  <h5 className="fw-bold mb-1">Partner Contributions</h5>
                  <small className="text-muted">
                    {paidCount} of {totalPartners} partners marked as paid
                  </small>
                </div>

                {/* Mark All Controls */}
                <div className="btn-group w-100 w-md-auto" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm flex-fill"
                    onClick={() => markAllPaid(true)}
                    disabled={paidCount === totalPartners}
                  >
                    <i className="bi bi-check-all me-1"></i>
                    Mark All Paid
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm flex-fill"
                    onClick={() => markAllPaid(false)}
                    disabled={paidCount === 0}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Mark All Unpaid
                  </button>
                </div>
              </div>

              {/* Partner List */}
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {partnerInputs.map((p) => (
                    <li
                      key={p.partnerId}
                      className={`list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 ${
                        p.paid ? "bg-success bg-opacity-10" : ""
                      }`}
                    >
                      {/* Left: Checkbox + Partner Info */}
                      <div className="d-flex align-items-start w-100">
                        <div className="me-3 pt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={p.paid}
                            onChange={() => togglePaid(p.partnerId)}
                            id={`partner-${p.partnerId}`}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <strong className={p.paid ? "text-success" : ""}>
                            {p.name}
                          </strong>
                          <span className="text-muted ms-2">({p.share}%)</span>
                          <br />
                          <small
                            className={`fw-semibold ${
                              p.paid ? "text-success" : "text-muted"
                            }`}
                          >
                            Payable: ₹{p.amount.toLocaleString()}
                          </small>
                        </div>
                      </div>

                      {/* Right: Status Badge */}
                      <div className="text-start text-sm-end w-100 w-sm-auto">
                        {p.paid ? (
                          <span className="badge bg-success rounded-pill px-3 py-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Paid
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                            <i className="bi bi-clock me-1"></i>
                            Pending
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Summary */}
              <div className="card-footer bg-light border-0 py-2">
                <div className="row text-center">
                  <div className="col-4">
                    <small className="text-muted d-block">Partners</small>
                    <strong className="text-primary">{totalPartners}</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Paid</small>
                    <strong className="text-success">{paidCount}</strong>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Pending</small>
                    <strong className="text-warning">
                      {totalPartners - paidCount}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 d-flex flex-column flex-sm-row gap-2">
          <button
            type="submit"
            className="btn btn-primary rounded-pill px-4"
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
              <>
                <i className="bi bi-check-lg me-2"></i>
                Save Expense
              </>
            )}
          </button>
          <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
            <i className="bi bi-arrow-left me-2"></i>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
