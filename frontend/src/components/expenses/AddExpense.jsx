import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddExpense = () => {
  const [cars, setCars] = useState([]);
  const [partners, setPartners] = useState([]);
  const [expense, setExpense] = useState({
    car: "",
    title: "",
    type: "expense",
    date: "",
    category: "",
    customCategory: "",
    totalAmount: "",
    notes: "",
    partners: [],
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // fetch cars initially
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsRes = await axios.get("http://localhost:5000/api/cars");
        setCars(carsRes.data);
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
    };
    fetchCars();
  }, []);

  // fetch partners when car is selected
  useEffect(() => {
    const fetchPartners = async () => {
      if (!expense.car) return;
      try {
        const partnersRes = await axios.get(
          `http://localhost:5000/api/partners/car/${expense.car}`
        );
        console.log(partnersRes);

        const partnerState = partnersRes.data.map((p) => ({
          partnerId: p._id,
          name: p.name,
          sharePercentage: p.sharePercentage,
          amount: 0,
          paid: false,
        }));
        setPartners(partnerState);
        setExpense((prev) => ({ ...prev, partners: partnerState }));
      } catch (err) {
        console.error("Error fetching partners:", err);
      }
    };
    fetchPartners();
  }, [expense.car]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalAmount") {
      const total = Number(value) || 0;
      const updatedPartners = expense.partners.map((p) => {
        const percentage = p.sharePercentage || 0;
        const calculatedAmount = ((total * percentage) / 100).toFixed(2);
        return { ...p, amount: calculatedAmount };
      });
      setExpense({ ...expense, totalAmount: value, partners: updatedPartners });
    } else {
      setExpense({ ...expense, [name]: value });
    }
  };

  const handlePartnerChange = (index, field, value) => {
    const updatedPartners = [...expense.partners];
    if (field === "paid") {
      updatedPartners[index][field] = value.target.checked;
    } else {
      updatedPartners[index][field] = value;
    }
    setExpense({ ...expense, partners: updatedPartners });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const finalCategory =
      expense.category === "Others" ? expense.customCategory : expense.category;

    try {
      await axios.post("http://localhost:5000/api/expenses", {
        car: expense.car,
        title: expense.title,
        type: expense.type,
        date: expense.date,
        category: finalCategory,
        totalAmount: expense.totalAmount,
        notes: expense.notes,
        partners: expense.partners.map((p) => ({
          partnerId: p.partnerId,
          amount: Number(p.amount) || 0,
          paid: p.paid,
        })),
      });
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
            <i className="bi bi-plus-circle me-2"></i>Add New Expense
          </h2>
          <p className="opacity-75">
            Record and track your car-related spending
          </p>
          <div
            className="p-3 rounded-3 d-inline-block"
            style={{
              background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
              minWidth: "220px",
            }}
          >
            <h6 className="mb-1">Expense Entry</h6>
            <h5 className="fw-bold">
              <i className="bi bi-receipt me-2"></i>New Record
            </h5>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10 col-12">
          <div
            className="card border-0 shadow-lg"
            style={{ borderRadius: "18px", animation: "fadeUp 0.4s ease-out" }}
          >
            <div
              className="card-header border-0 text-center"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "18px 18px 0 0",
              }}
            >
              <div
                className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                style={{ width: "70px", height: "70px", marginTop: "15px" }}
              >
                <i
                  className="bi bi-receipt fs-3"
                  style={{ color: "#667eea", fontSize: "1.5rem" }}
                ></i>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Car */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-car-front-fill me-2 text-primary"></i>
                      Select Car
                    </label>
                    <select
                      name="car"
                      className="form-select rounded-pill shadow-sm border-2"
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

                  {/* Title */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-pencil-square me-2 text-primary"></i>
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar-date me-2 text-primary"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tags me-2 text-primary"></i>Category
                    </label>
                    <select
                      name="category"
                      className="form-select rounded-pill shadow-sm border-2"
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
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-pencil-square me-2 text-primary"></i>
                        Specify Category
                      </label>
                      <input
                        type="text"
                        name="customCategory"
                        className="form-control rounded-pill shadow-sm border-2"
                        value={expense.customCategory}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  {/* Total */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-dollar me-2 text-primary"></i>
                      Total Amount
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.totalAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-stickies me-2 text-primary"></i>Notes
                    </label>
                    <input
                      type="text"
                      name="notes"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.notes}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Partner-wise */}
                  <div className="col-12">
                    <h5 className="fw-bold text-primary mt-3 mb-2">
                      <i className="bi bi-people-fill me-2"></i>Partner
                      Contributions
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Partner</th>
                            <th>Share %</th>
                            <th>Amount</th>
                            <th>Paid?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expense.partners.map((p, index) => (
                            <tr key={p.partnerId}>
                              <td>{p.name}</td>
                              <td>{p.sharePercentage}%</td>
                              <td style={{ width: "150px" }}>
                                <input
                                  type="number"
                                  className="form-control rounded-pill"
                                  value={p.amount}
                                  onChange={(e) =>
                                    handlePartnerChange(
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={p.paid}
                                  onChange={(e) =>
                                    handlePartnerChange(index, "paid", e)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="col-12 mt-3 d-grid gap-2">
                    <button
                      type="submit"
                      className={`btn btn-lg rounded-pill shadow-lg fw-bold ${
                        saving ? "btn-secondary" : "btn-primary"
                      }`}
                      style={{
                        background: saving
                          ? undefined
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        padding: "12px 0",
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Saving Expense...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>Save
                          Expense
                        </>
                      )}
                    </button>
                    <Link
                      to="/"
                      className="btn btn-outline-secondary py-2 rounded-pill"
                    >
                      ⬅ Back to Dashboard
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
