import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function ExpenseList() {
  const { carId } = useParams();
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [partnerTotals, setPartnerTotals] = useState({});
  const [partnerPendings, setPartnerPendings] = useState({});
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // -----------------------
  // Fetch expenses from API
  // -----------------------
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://uss-car-manager-f0gv.onrender.com/api/expenses/car/${carId}`
      );
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Toggle paid status handler
  // -----------------------
  // This reads the current value from `expenses`, flips it, updates state,
  // then (optionally) sends a backend update. The filter-effect will recalc summaries.
  const togglePaymentStatus = async (expenseId, partnerId) => {
    // find current partner state
    const currentExpense = expenses.find((e) => e._id === expenseId);
    if (!currentExpense) {
      console.warn("Expense not found for toggle:", expenseId);
      return;
    }
    const partnerObj =
      currentExpense.partners?.find(
        (pp) => (pp.partnerId?._id || pp.partnerId) === partnerId
      ) || null;
    const currentPaid = partnerObj?.paid === true;
    const newPaid = !currentPaid;

    // Optimistic UI update: update the source 'expenses'
    setExpenses((prev) =>
      prev.map((exp) =>
        exp._id === expenseId
          ? {
              ...exp,
              partners: exp.partners?.map((p) =>
                (p.partnerId?._id || p.partnerId) === partnerId
                  ? { ...p, paid: newPaid }
                  : p
              ),
            }
          : exp
      )
    );

    // Optional: persist to backend (uncomment if your API supports this endpoint)
    try {
      // Replace endpoint with your actual backend route if different.
      await axios.put(
        `https://uss-car-manager-f0gv.onrender.com/api/expenses/${expenseId}/partners/${partnerId}`,
        { paid: newPaid }
      );
    } catch (err) {
      // If backend fails, you might want to rollback or re-fetch. For now, log error.
      console.error("Failed to persist paid status to backend:", err);
      // Optionally re-fetch to restore server truth:
      // fetchExpenses();
    }
  };

  // -----------------------
  // Delete expense
  // -----------------------
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
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      Swal.fire("Deleted!", "Expense has been deleted.", "success");
    } catch (err) {
      console.error("Error deleting expense:", err);
      Swal.fire("Error!", "Failed to delete expense.", "error");
    } finally {
      setDeleting(null);
    }
  };

  // -----------------------
  // Category styling helpers
  // -----------------------
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

  // -----------------------
  // Recalculate filteredExpenses, totals and partner summaries
  // run whenever `expenses` or filters change — this avoids loops
  // -----------------------
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

    // total amount (for filtered)
    setTotalAmount(
      filtered.reduce(
        (sum, exp) => sum + (exp.totalAmount || exp.amount || 0),
        0
      )
    );

    // partner totals & pendings (from filtered)
    const totals = {};
    const pendings = {};
    filtered.forEach((exp) => {
      const expectedShare =
        exp.totalAmount > 0 && exp.partners?.length > 0
          ? exp.totalAmount / exp.partners.length
          : 0;

      exp.partners?.forEach((p) => {
        const id = p.partnerId?._id || p.partnerId;
        const name = p.partnerId?.name || "Partner";
        if (!totals[id]) totals[id] = { name, amount: 0 };
        if (!pendings[id]) pendings[id] = { name, amount: 0 };

        totals[id].amount += p.amount || 0;

        // pending if partner not marked paid && paidAmount < expectedShare
        const paidAmount = p.amount || 0;
        if (!p.paid && paidAmount < expectedShare) {
          pendings[id].amount += Math.max(expectedShare - paidAmount, 0);
        }
      });
    });

    setPartnerTotals(totals);
    setPartnerPendings(pendings);
  }, [expenses, categoryFilter, dateFilter, dateRange]);

  // -----------------------
  // Initial fetch
  // -----------------------
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId, location]);

  // -----------------------
  // Loading UI
  // -----------------------
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

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="container my-4">
      {/* Header (kept same) */}
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
            <h4 className="fw-bold mb-0">
              ₹{Math.round(totalAmount).toLocaleString()}
            </h4>
          </div>

          <Link
            to="/add-expense"
            className="btn btn-light shadow-sm rounded-pill px-4 py-2"
          >
            <i className="bi bi-plus-lg me-1"></i> Add Expense
          </Link>
        </div>
      </div>

      {/* Partner-wise Totals & Pending Summary (top) */}
      {Object.keys(partnerTotals).length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Partner-wise Expense Summary</h5>
                <ul className="list-group list-group-flush">
                  {Object.values(partnerTotals).map((p, i) => (
                    <li
                      key={i}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{p.name}</span>
                      <span className="fw-bold text-primary">
                        ₹{Math.round(p.amount).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h5 className="fw-bold mb-3">
              Partner-wise Expense Pending Summary
            </h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {(() => {
                  const summary = {};

                  // Collect pending per partner
                  filteredExpenses.forEach((exp) => {
                    const expectedShare =
                      exp.totalAmount && exp.partners?.length > 0
                        ? exp.totalAmount / exp.partners.length
                        : 0;

                    exp.partners?.forEach((p) => {
                      const paidAmount = p.amount || 0;
                      const pending =
                        paidAmount < expectedShare
                          ? expectedShare - paidAmount
                          : 0;

                      if (pending > 0) {
                        const partnerName = p.partnerId?.name || "Partner";

                        if (!summary[partnerName]) {
                          summary[partnerName] = {
                            totalPending: 0,
                            details: [],
                          };
                        }

                        // Add this expense’s pending
                        if (pending >= 1) {
                          summary[partnerName].totalPending += pending;
                          summary[partnerName].details.push({
                            expenseCategory: exp.category,
                            pendingAmount: pending,
                          });
                        }
                      }
                    });
                  });

                  // Render result
                  if (Object.keys(summary).length > 0) {
                    return (
                      <ul className="list-unstyled mb-0">
                        {Object.entries(summary).map(([partner, data]) => (
                          <li key={partner} className="border-bottom py-2">
                            <div className="d-flex justify-content-between">
                              {data.totalPending > 4 && (
                                <>
                                  {" "}
                                  <strong>{partner}</strong>
                                  <span className="fw-bold text-danger">
                                    Total Pending: ₹
                                    {data.totalPending.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            {/* Show breakdown per expense */}
                            <ul className="list-unstyled small ms-3 mt-1">
                              {data.details.map((d, idx) => {
                                return (
                                  <>
                                    {d.pendingAmount > 4 && (
                                      <li
                                        key={idx}
                                        className="d-flex justify-content-between"
                                      >
                                        <span>{d.expenseCategory}</span>
                                        <span className="text-warning">
                                          ₹{d.pendingAmount.toFixed(1)}
                                        </span>
                                      </li>
                                    )}
                                  </>
                                );
                              })}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    return (
                      <p className="text-success mb-0">
                        All partners are settled 🎉
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses */}
      {filteredExpenses.length > 0 ? (
        <>
          <div className="row g-4">
            {filteredExpenses.map((exp, index) => (
              <div
                key={exp._id}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
              >
                <div
                  className="card border-0 shadow-lg h-100 expense-card"
                  style={{
                    borderRadius: "18px",
                    animation: `fadeUp 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="card-header border-0 text-center"
                    style={{
                      background: getCategoryGradient(exp.category),
                      borderRadius: "18px 18px 0 0",
                    }}
                  >
                    <div
                      className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                      style={{
                        width: "70px",
                        height: "70px",
                        marginTop: "15px",
                      }}
                    >
                      <i
                        className={`${getCategoryIcon(exp.category)} fs-3`}
                        style={{ color: "#667eea" }}
                      ></i>
                    </div>
                  </div>

                  {/* Card Body */}
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
                      ₹
                      {Math.round(
                        exp.totalAmount || exp.amount || 0
                      ).toLocaleString()}
                    </h3>

                    {/* Partner Contributions */}
                    <ul className="list-unstyled small mb-0">
                      {exp.partners?.map((p) => {
                        const expectedShare =
                          exp.totalAmount > 0 && exp.partners.length > 0
                            ? exp.totalAmount / exp.partners.length
                            : 0;

                        const paidAmount = p.amount || 0;
                        const isPending = paidAmount < expectedShare - 5;

                        const partnerId = p.partnerId?._id || p.partnerId;

                        return (
                          <li
                            key={partnerId}
                            className="d-flex justify-content-between align-items-center border-bottom py-2"
                          >
                            {/* Left: Partner Info */}
                            <div>
                              <strong
                                className="d-block"
                                style={{ textAlign: "left" }}
                              >
                                {p.partnerId?.name || "Partner"}
                              </strong>
                              <span className="text-muted d-block">
                                Paid: ₹{Math.round(paidAmount)}
                              </span>
                              <span
                                className={`fw-semibold ${
                                  isPending ? "text-warning" : "text-success"
                                }`}
                              >
                                {isPending
                                  ? `Pending: ₹${(
                                      expectedShare - paidAmount
                                    ).toFixed(2)}`
                                  : "Settled"}
                              </span>
                            </div>

                            {/* Right: Status Badge */}
                            <div
                              role="button"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                togglePaymentStatus(exp._id, partnerId)
                              }
                              title="Click to toggle paid/pending"
                            >
                              {isPending ? (
                                <span className="badge bg-warning text-dark">
                                  Pending
                                </span>
                              ) : (
                                <span className="badge bg-success">Paid</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="text-muted small mt-2">
                      {exp.notes || "No notes provided"}
                    </p>
                  </div>

                  {/* Footer Actions */}
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

          {/* Partner-wise Pending Summary (below) */}
          <div className="mt-5">
            <h5 className="fw-bold mb-3">Partner-wise Pending Summary</h5>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {(() => {
                  const summary = {};

                  // Collect pending per partner
                  filteredExpenses.forEach((exp) => {
                    const expectedShare =
                      exp.totalAmount && exp.partners?.length > 0
                        ? exp.totalAmount / exp.partners.length
                        : 0;

                    exp.partners?.forEach((p) => {
                      const paidAmount = p.amount || 0;
                      const pending =
                        paidAmount < expectedShare
                          ? expectedShare - paidAmount
                          : 0;

                      if (pending > 0) {
                        const partnerName = p.partnerId?.name || "Partner";

                        if (!summary[partnerName]) {
                          summary[partnerName] = {
                            totalPending: 0,
                            details: [],
                          };
                        }

                        // Add this expense’s pending
                        summary[partnerName].totalPending += pending;
                        summary[partnerName].details.push({
                          expenseCategory: exp.category,
                          pendingAmount: pending,
                        });
                      }
                    });
                  });

                  // Render result
                  if (Object.keys(summary).length > 0) {
                    return (
                      <ul className="list-unstyled mb-0">
                        {Object.entries(summary).map(([partner, data]) => (
                          <li key={partner} className="border-bottom py-2">
                            <div className="d-flex justify-content-between">
                              <strong>{partner}</strong>
                              <span className="fw-bold text-danger">
                                Total Pending: ₹{data.totalPending.toFixed(2)}
                              </span>
                            </div>
                            {/* Show breakdown per expense */}
                            <ul className="list-unstyled small ms-3 mt-1">
                              {data.details.map((d, idx) => (
                                <li
                                  key={idx}
                                  className="d-flex justify-content-between"
                                >
                                  <span>{d.expenseCategory}</span>
                                  <span className="text-warning">
                                    ₹{d.pendingAmount.toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    return (
                      <p className="text-success mb-0">
                        All partners are settled 🎉
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </>
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
