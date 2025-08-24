import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function ExpenseList() {
  const { carId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch Expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/expenses/car/${carId}`
        );
        setExpenses(res.data);
        setFilteredExpenses(res.data);
        const total = res.data.reduce((sum, exp) => sum + exp.amount, 0);
        setTotalAmount(total);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [carId]);

  // Apply Filters
  useEffect(() => {
    let filtered = [...expenses];
    const now = new Date();

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (exp) => exp.category?.toLowerCase() === categoryFilter
      );
    }

    if (dateFilter === "lastWeek") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      filtered = filtered.filter((exp) => new Date(exp.date) >= lastWeek);
    } else if (dateFilter === "lastMonth") {
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((exp) => new Date(exp.date) >= lastMonth);
    } else if (dateFilter === "lastYear") {
      const lastYear = new Date();
      lastYear.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter((exp) => new Date(exp.date) >= lastYear);
    }

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= fromDate && expDate <= toDate;
      });
    }

    setFilteredExpenses(filtered);
    setTotalAmount(filtered.reduce((sum, exp) => sum + exp.amount, 0));
  }, [categoryFilter, dateFilter, dateRange, expenses]);

  // Delete Expense
  const handleDelete = async (expenseId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This expense will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      setDeleting(expenseId);
      await axios.delete(
        `https://uss-car-manager-f0gv.onrender.com/api/expenses/${expenseId}`
      );
      const updatedExpenses = expenses.filter((exp) => exp._id !== expenseId);
      setExpenses(updatedExpenses);
      Swal.fire("Deleted!", "Expense has been deleted.", "success");
    } catch (err) {
      console.error("Error deleting expense:", err);
      Swal.fire("Error!", "Failed to delete expense.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fuel: "bi-fuel-pump-fill",
      maintenance: "bi-wrench",
      insurance: "bi-shield-fill-check",
      repair: "bi-hammer",
      parking: "bi-p-square-fill",
      toll: "bi-coin",
      cleaning: "bi-droplet-fill",
      other: "bi-three-dots",
    };
    return icons[category?.toLowerCase()] || "bi-receipt";
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      fuel: "linear-gradient(135deg, #FF6B35, #F7931E)",
      maintenance: "linear-gradient(135deg, #4ECDC4, #44A08D)",
      insurance: "linear-gradient(135deg, #45B7D1, #96C93D)",
      repair: "linear-gradient(135deg, #F7931E, #FF6B35)",
      parking: "linear-gradient(135deg, #96CEB4, #FFECD2)",
      toll: "linear-gradient(135deg, #FECA57, #FF9A9E)",
      cleaning: "linear-gradient(135deg, #48CAE4, #007EA7)",
      other: "linear-gradient(135deg, #6C5CE7, #A777E3)",
    };
    return (
      gradients[category?.toLowerCase()] ||
      "linear-gradient(135deg, #667eea, #764ba2)"
    );
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border text-primary mb-3"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        />
        <h5 className="text-muted">Loading your expenses...</h5>
        <p className="text-secondary">Please wait while we fetch your data</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Header */}
      {/* <div
        className="card shadow-lg border-0 text-center text-white mb-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-car-front-fill me-2"></i>Car Expenses Dashboard
          </h2>
          <p className="opacity-75">
            Track and manage all your vehicle-related expenses
          </p>
          <div
            className="p-3 rounded-3 d-inline-block"
            style={{
              background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
              minWidth: "220px",
            }}
          >
            <h6 className="mb-1">Total Expenses</h6>
            <h3 className="fw-bold">₹{totalAmount.toLocaleString()}</h3>
          </div>
          <div className="mt-3">
            <Link
              to="/add-expense"
              className="btn btn-light shadow-sm px-4 rounded-pill"
            >
              <i className="bi bi-plus-lg me-2"></i>Add New Expense
            </Link>
          </div>
        </div>
      </div> */}
      <div
        className="card shadow-sm border-0 text-center text-white mb-3 expenses-card"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-3 p-md-4">
          {/* Title */}
          <h4 className="fw-bold mb-1 d-md-none" style={{ fontSize: "1.1rem" }}>
            <i className="bi bi-car-front-fill me-1"></i> Expenses
          </h4>
          <h3 className="fw-bold mb-2 d-none d-md-block">
            <i className="bi bi-car-front-fill me-2"></i> Car Expenses Dashboard
          </h3>

          {/* Subtitle */}
          <p
            className="opacity-75 mb-3 d-none d-md-block"
            style={{ fontSize: "0.95rem" }}
          >
            Track and manage all your vehicle-related expenses
          </p>
          <p
            className="opacity-75 mb-3 d-md-none"
            style={{ fontSize: "0.85rem" }}
          >
            Manage your car expenses
          </p>

          {/* Expenses Box */}
          <div
            className="p-2 p-md-3 rounded-3 mx-auto mb-3"
            style={{
              background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
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
            to="/add-expense"
            className="btn btn-light shadow-sm w-100 w-md-auto rounded-pill px-4 py-2"
            style={{ fontSize: "0.9rem" }}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Expense
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body row g-3">
          <div className="col-md-4 col-12">
            <label className="form-label small">Category</label>
            <select
              className="form-select rounded-pill"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="insurance">Insurance</option>
              <option value="repair">Repair</option>
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

      {/* Expenses */}
      {filteredExpenses.length > 0 ? (
        <div className="row g-4">
          {filteredExpenses.map((exp, index) => (
            <div key={exp._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
              <div
                className="card border-0 shadow-lg h-100 expense-card"
                style={{
                  borderRadius: "18px",
                  animation: `fadeUp 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <div
                  className="card-header border-0 text-center"
                  style={{
                    background: getCategoryGradient(exp.category),
                    borderRadius: "18px 18px 0 0",
                  }}
                >
                  <div
                    className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                    style={{ width: "70px", height: "70px", marginTop: "15px" }}
                  >
                    <i
                      className={`${getCategoryIcon(exp.category)} fs-3`}
                      style={{ color: "#667eea" }}
                    ></i>
                  </div>
                </div>
                <div className="card-body text-center">
                  <h5 className="fw-bold text-capitalize">{exp.category}</h5>
                  <small className="text-secondary d-block mb-2">
                    <i className="bi bi-calendar3 me-1"></i>
                    {new Date(exp.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                  <h3 className="fw-bold text-primary">
                    ₹{exp.amount.toLocaleString()}
                  </h3>
                  <p className="text-muted small mt-2">
                    {exp.notes || "No notes provided"}
                  </p>
                </div>
                <div className="card-footer d-flex gap-2 bg-white border-0">
                  <Link
                    to={`/edit-expense/${exp._id}`}
                    className="btn btn-outline-primary flex-fill rounded-pill"
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    disabled={deleting === exp._id}
                    className="btn btn-outline-danger flex-fill rounded-pill"
                  >
                    {deleting === exp._id ? (
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
          <i className="bi bi-receipt display-4 text-primary"></i>
          <h4 className="text-muted mt-3">No Expenses Found</h4>
          <p className="text-secondary">No expenses match your filters.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .expense-card { transition: transform 0.3s ease; }
        .expense-card:hover { transform: translateY(-8px); }
      `}</style>
    </div>
  );
}
