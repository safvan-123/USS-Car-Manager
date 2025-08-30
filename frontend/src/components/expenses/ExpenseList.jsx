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
          `http://localhost:5000/api/expenses/car/${carId}`
        );

        setExpenses(res.data);
        setFilteredExpenses(res.data);

        // ✅ Handle both old (amount) and new (totalAmount)
        const total = res.data.reduce(
          (sum, exp) => sum + (exp.totalAmount || exp.amount || 0),
          0
        );
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

    // ✅ Recalculate total for filtered results
    setTotalAmount(
      filtered.reduce(
        (sum, exp) => sum + (exp.totalAmount || exp.amount || 0),
        0
      )
    );
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
      await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`);
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
      service: "bi-wrench",
      insurance: "bi-shield-fill-check",
      tax: "bi-cash-coin",
      others: "bi-three-dots",
    };
    return icons[category?.toLowerCase()] || "bi-receipt";
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      fuel: "linear-gradient(135deg, #FF6B35, #F7931E)",
      service: "linear-gradient(135deg, #4ECDC4, #44A08D)",
      insurance: "linear-gradient(135deg, #45B7D1, #96C93D)",
      tax: "linear-gradient(135deg, #FECA57, #FF9A9E)",
      others: "linear-gradient(135deg, #6C5CE7, #A777E3)",
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
      <div
        className="card shadow-sm border-0 text-center text-white mb-3 expenses-card"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-2">
            <i className="bi bi-car-front-fill me-2"></i> Car Expenses Dashboard
          </h3>
          <p className="opacity-75 mb-3">
            Track and manage all your vehicle-related expenses
          </p>

          <div
            className="p-2 p-md-3 rounded-3 mx-auto mb-3"
            style={{
              background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
              minWidth: "160px",
              maxWidth: "260px",
            }}
          >
            <h6 className="mb-1">Total</h6>
            <h4 className="fw-bold mb-0">₹{totalAmount.toLocaleString()}</h4>
          </div>

          <Link
            to="/add-expense"
            className="btn btn-light shadow-sm rounded-pill px-4 py-2"
          >
            <i className="bi bi-plus-lg me-1"></i> Add Expense
          </Link>
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

                  {/* ✅ Handle both amount (old) & totalAmount (new) */}
                  <h3 className="fw-bold text-primary">
                    ₹{(exp.totalAmount || exp.amount || 0).toLocaleString()}
                  </h3>

                  {/* Partner breakdown */}
                  {exp.partners && exp.partners.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold text-muted">Partners</h6>
                      {console.log(exp.partners)}
                      {(() => {
                        const allEqual =
                          exp.partners.length > 1 &&
                          exp.partners.every(
                            (p) =>
                              p.sharePercentage ===
                              exp.partners[0].sharePercentage
                          );

                        if (allEqual) {
                          // ✅ Same share → show all names with share %
                          const names = exp.partners.map(
                            (p) => p.partnerId?.name || "Partner"
                          );
                          const share = exp.partners[0].sharePercentage;
                          const amountEach = exp.partners[0].amount;

                          return (
                            <p className="small mb-1">
                              <strong>{names.join(", ")}</strong> <br />
                              <span className="text-muted">
                                ₹{amountEach} each ({share}% share)
                              </span>
                            </p>
                          );
                        } else {
                          // ❌ Different share → separate lines
                          return (
                            <ul className="list-unstyled small mb-0">
                              {exp.partners.map((p) => {
                                return (
                                  <li
                                    key={p.partnerId?._id || p.partnerId}
                                    className="d-flex align-items-center justify-content-between border-bottom py-1"
                                  >
                                    <div>
                                      <strong>
                                        {p.partnerId?.name || "Partner"}
                                      </strong>{" "}
                                      <span className="text-muted">
                                        ({p.sharePercentage}%)
                                      </span>
                                      <div className="text-muted">
                                        ₹{p.amount}
                                      </div>
                                    </div>
                                    <div>
                                      {p.paid ? (
                                        <span className="badge bg-success">
                                          Paid
                                        </span>
                                      ) : (
                                        <span className="badge bg-warning text-dark">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }
                      })()}
                    </div>
                  )}

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
    </div>
  );
}
