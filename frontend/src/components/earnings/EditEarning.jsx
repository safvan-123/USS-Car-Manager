import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const EditEarning = () => {
  const navigate = useNavigate();
  const { id, carId } = useParams();

  const [cars, setCars] = useState([]);
  const [earning, setEarning] = useState({
    car: carId || "",
    date: "",
    source: "",
    customSource: "",
    amount: "",
    notes: "",
  });
  const [partnerInputs, setPartnerInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch cars
  useEffect(() => {
    axios
      .get("https://uss-car-manager-f0gv.onrender.com/api/cars")
      .then((res) => setCars(res.data))
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  // 🔹 Fetch existing earning
  useEffect(() => {
    const fetchEarning = async () => {
      try {
        const { data } = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/earnings/${id}`
        );
        setEarning({
          car: data.car?._id || carId,
          date: data.date ? data.date.split("T")[0] : "",
          source: data.source,
          customSource:
            data.source && !["Trip", "Rent", "Bonus"].includes(data.source)
              ? data.source
              : "",
          amount: data.amount,
          notes: data.notes || "",
        });

        if (data.partners && data.partners.length > 0) {
          setPartnerInputs(
            data.partners.map((p) => ({
              partnerId: p.partnerId?._id || p.partnerId,
              name: p.partnerId?.name || "Partner",
              share: 0,
              amount: Math.round(p.amount),
              paid: p.paid,
            }))
          );
        } else {
          fetchPartners(data.car?._id || carId, data.amount);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load earning details");
      } finally {
        setLoading(false);
      }
    };
    fetchEarning();
  }, [id, carId]);

  // 🔹 Fetch partners for selected car
  const fetchPartners = (car, amount = 0) => {
    if (!car) return;
    axios
      .get(`https://uss-car-manager-f0gv.onrender.com/api/partners/car/${car}`)
      .then((res) => {
        const fetched = res.data.map((p) => {
          const payable = (amount * (Number(p.sharePercentage) || 0)) / 100;
          return {
            partnerId: p._id,
            name: p.name,
            share: Number(p.sharePercentage) || 0,
            amount: Math.round(Number.isNaN(payable) ? 0 : payable),
            paid: false,
          };
        });
        setPartnerInputs(fetched);
      })
      .catch((err) => console.error("Error fetching partners:", err));
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    setEarning({ ...earning, [e.target.name]: e.target.value });
  };

  // 🔹 Update partner amounts whenever amount changes
  useEffect(() => {
    const total = parseFloat(earning.amount) || 0;
    setPartnerInputs((prev) =>
      prev.map((p) => {
        if (p.share > 0) {
          const payable = (total * (Number(p.share) || 0)) / 100;
          return {
            ...p,
            amount: Math.round(Number.isNaN(payable) ? 0 : payable),
          };
        }
        return p;
      })
    );
  }, [earning.amount, partnerInputs.length]);

  // 🔹 Toggle Paid/Unpaid
  const togglePaid = (id) => {
    setPartnerInputs((prev) =>
      prev.map((p) => (p.partnerId === id ? { ...p, paid: !p.paid } : p))
    );
  };

  // 🔹 Mark All Paid/Unpaid
  const markAllPaid = (paidStatus) => {
    setPartnerInputs((prev) => prev.map((p) => ({ ...p, paid: paidStatus })));
  };

  // 🔹 Paid counts
  const paidCount = partnerInputs.filter((p) => p.paid).length;
  const totalPartners = partnerInputs.length;

  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalSource =
      earning.source === "Other" ? earning.customSource : earning.source;

    try {
      await axios.put(
        `https://uss-car-manager-f0gv.onrender.com/api/earnings/${id}`,
        {
          car: earning.car,
          date: earning.date,
          source: finalSource,
          amount: parseFloat(earning.amount),
          notes: earning.notes,
          partners: partnerInputs.map((p) => ({
            partnerId: p.partnerId,
            amount: p.amount,
            paid: p.paid,
          })),
        }
      );
      navigate(`/earnings/${earning.car}`);
    } catch (err) {
      console.error("Error updating earning:", err);
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
            <i className="bi bi-pencil-square me-2"></i>Edit Earning
          </h2>
          <p className="opacity-75">Update your car’s earning record</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="card shadow-lg border-0 p-4">
        <div className="row g-4">
          {/* Car Select */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Select Car</label>
            <select
              name="car"
              className="form-select rounded-pill"
              value={earning.car}
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
              value={earning.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Source */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Source</label>
            <select
              name="source"
              className="form-select rounded-pill"
              value={earning.source}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Source --</option>
              <option value="Trip">Trip</option>
              <option value="Rent">Rent</option>
              <option value="Bonus">Bonus</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Source */}
          {earning.source === "Other" && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Custom Source</label>
              <input
                type="text"
                name="customSource"
                className="form-control rounded-pill"
                value={earning.customSource}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Amount */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className="form-control rounded-pill"
              value={earning.amount}
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
              value={earning.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 🔹 Partner Section */}
        {partnerInputs.length > 0 && (
          <div className="mt-5">
            <div className="card border-0 shadow-sm">
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
                          {p.share > 0 && (
                            <span className="text-muted ms-2">
                              ({p.share}%)
                            </span>
                          )}
                          <br />
                          <small
                            className={`fw-semibold ${
                              p.paid ? "text-success" : "text-muted"
                            }`}
                          >
                            Payable: ₹{Math.round(p.amount).toLocaleString()}
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
              <div className="card-footer bg-light border-0 py-2 my-2">
                <div className="row text-center g-3">
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
            className="btn btn-success rounded-pill px-4"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Update Earning
              </>
            )}
          </button>
          <Link
            to={`/earnings/${earning.car}`}
            className="btn btn-outline-secondary rounded-pill px-4"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditEarning;
