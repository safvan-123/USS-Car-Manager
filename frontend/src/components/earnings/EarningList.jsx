import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function EarningList() {
  const { carId } = useParams();

  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    fetchEarnings();
  }, [carId]);

  const fetchEarnings = async () => {
    try {
      const res = await axios.get(
        `https://uss-car-manager-f0gv.onrender.com/api/earnings/car/${carId}`
      );
      setEarnings(res.data);
    } catch (err) {
      console.error("Error fetching earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this earning?")) return;
    setDeleting(id);
    try {
      await axios.delete(
        `https://uss-car-manager-f0gv.onrender.com/api/earnings/${id}`
      );
      setEarnings(earnings.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setDeleting(null);
    }
  };

  // 🎯 Filters
  const filteredEarnings = earnings.filter((e) => {
    let pass = true;

    if (sourceFilter !== "all" && e.source !== sourceFilter) pass = false;

    const earningDate = new Date(e.date);

    if (dateFilter === "lastWeek") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (earningDate < weekAgo) pass = false;
    }
    if (dateFilter === "lastMonth") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (earningDate < monthAgo) pass = false;
    }
    if (dateFilter === "lastYear") {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      if (earningDate < yearAgo) pass = false;
    }

    if (dateRange.from && earningDate < new Date(dateRange.from)) pass = false;
    if (dateRange.to && earningDate > new Date(dateRange.to)) pass = false;

    return pass;
  });

  const totalAmount = filteredEarnings.reduce((sum, e) => sum + e.amount, 0);

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case "trip":
        return "bi bi-truck";
      case "rent":
        return "bi bi-house-door";
      case "bonus":
        return "bi bi-gift";
      default:
        return "bi bi-cash";
    }
  };

  if (loading) {
    return <p className="text-center my-5">Loading earnings...</p>;
  }

  return (
    <div className="container my-4">
      {/* Header */}
      <div
        className="card shadow-sm border-0 text-center text-white mb-3 earnings-card"
        style={{
          background: "linear-gradient(135deg, #00b09b, #96c93d)",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-3 p-md-4">
          {/* Title */}
          <h5 className="fw-bold mb-1 d-md-none" style={{ fontSize: "1.1rem" }}>
            <i className="bi bi-cash-coin me-1"></i> Earnings
          </h5>
          <h3 className="fw-bold mb-2 d-none d-md-block">
            <i className="bi bi-cash-coin me-2"></i> Car Earnings Dashboard
          </h3>

          {/* Subtitle */}
          <p
            className="opacity-75 mb-3 d-none d-md-block"
            style={{ fontSize: "0.95rem" }}
          >
            Track and manage all your vehicle income
          </p>
          <p
            className="opacity-75 mb-3 d-md-none"
            style={{ fontSize: "0.85rem" }}
          >
            Manage your car income
          </p>

          {/* Earnings Box */}
          <div
            className="p-2 p-md-3 rounded-3 mx-auto mb-3"
            style={{
              background: "linear-gradient(135deg, #43cea2, #185a9d)",
              minWidth: "160px",
              maxWidth: "260px",
            }}
          >
            <h6 className="mb-1" style={{ fontSize: "0.9rem" }}>
              Total
            </h6>
            <h4 className="fw-bold mb-0 fs-md-2">
              ₹{totalAmount.toLocaleString()}
            </h4>
          </div>

          {/* Button */}
          <Link
            to={`/add-earning?carId=${carId}`}
            className="btn btn-light shadow-sm w-100 w-md-auto rounded-pill px-4 py-2"
            style={{ fontSize: "0.9rem" }}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Earning
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body row g-3">
          <div className="col-md-4 col-12">
            <label className="form-label small">Source</label>
            <select
              className="form-select rounded-pill"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="trip">Trip</option>
              <option value="rent">Rent</option>
              <option value="bonus">Bonus</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-4 col-12">
            <label className="form-label small">Quick Date Filter</label>
            <select
              className="form-select rounded-pill"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
          <div className="col-md-4 col-12">
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small">From</label>
                <input
                  type="date"
                  className="form-control rounded-pill"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                />
              </div>
              <div className="col-6">
                <label className="form-label small">To</label>
                <input
                  type="date"
                  className="form-control rounded-pill"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings */}
      {filteredEarnings.length > 0 ? (
        <div className="row g-4">
          {filteredEarnings.map((e, index) => (
            <div key={e._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
              <div
                className="card earning-item border-0 shadow-lg h-100"
                style={{
                  borderRadius: "18px",
                  animation: `fadeUp 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <div
                  className="card-header border-0 text-center"
                  style={{
                    background: "linear-gradient(135deg, #43cea2, #185a9d)",
                    borderRadius: "18px 18px 0 0",
                  }}
                >
                  <div
                    className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                    style={{ width: "70px", height: "70px", marginTop: "15px" }}
                  >
                    <i
                      className={`${getSourceIcon(e.source)} fs-3`}
                      style={{ color: "#00b09b" }}
                    ></i>
                  </div>
                </div>
                <div className="card-body text-center">
                  <h5 className="fw-bold text-capitalize">{e.source}</h5>
                  <small className="text-secondary d-block mb-2">
                    <i className="bi bi-calendar3 me-1"></i>
                    {new Date(e.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                  <h3 className="fw-bold text-success">
                    ₹{e.amount.toLocaleString()}
                  </h3>
                  <p className="text-muted small mt-2">
                    {e.notes || "No notes provided"}
                  </p>
                </div>
                <div className="card-footer d-flex gap-2 bg-white border-0">
                  <Link
                    to={`/edit-earning/${e._id}`}
                    className="btn btn-outline-success flex-fill rounded-pill"
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(e._id)}
                    disabled={deleting === e._id}
                    className="btn btn-outline-danger flex-fill rounded-pill"
                  >
                    {deleting === e._id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <i className="bi bi-trash3 me-2"></i>Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-wallet2 display-4 text-success"></i>
          <h4 className="text-muted mt-3">No Earnings Found</h4>
          <p className="text-secondary">No earnings match your filters.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .earning-item {
          transition: transform 0.3s;
        }
        .earning-item:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}
