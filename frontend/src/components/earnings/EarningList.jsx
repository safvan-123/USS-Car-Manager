import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

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

  const handleDelete = async (id, source, amount) => {
    const result = await Swal.fire({
      title: "Delete Earning?",
      html: `<div class="text-center">
        <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 3rem;"></i>
        <p class="mt-3 mb-2">Are you sure you want to delete this earning?</p>
        <div class="bg-light p-3 rounded mt-3">
          <strong>${source}</strong><br>
          <span class="text-success fs-5">₹${Math.round(
            amount
          ).toLocaleString()}</span>
        </div>
        <p class="text-muted small mt-2">This action cannot be undone!</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-trash3 me-2"></i>Yes, Delete',
      cancelButtonText: '<i class="bi bi-x-lg me-2"></i>Cancel',
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      reverseButtons: true,
      customClass: {
        popup: "swal2-responsive",
        confirmButton: "btn btn-danger px-4",
        cancelButton: "btn btn-secondary px-4",
      },
      buttonsStyling: false,
      width: window.innerWidth < 768 ? "90%" : "32rem",
      padding: "2rem 1rem",
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setDeleting(id);
      Swal.fire({
        title: "Deleting...",
        html: '<div class="spinner-border text-danger" role="status"><span class="visually-hidden">Loading...</span></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: { popup: "swal2-responsive" },
        width: window.innerWidth < 768 ? "80%" : "24rem",
      });

      try {
        await axios.delete(
          `https://uss-car-manager-f0gv.onrender.com/api/earnings/${id}`
        );
        setEarnings((prev) => prev.filter((e) => e._id !== id));
        await Swal.fire({
          title: "Deleted!",
          html: `<div class="text-center">
            <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
            <p class="mt-3">Earning has been successfully deleted.</p>
          </div>`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#198754",
          customClass: {
            popup: "swal2-responsive",
            confirmButton: "btn btn-success px-4",
          },
          buttonsStyling: false,
          width: window.innerWidth < 768 ? "80%" : "24rem",
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error("Error deleting:", err);
        await Swal.fire({
          title: "Error!",
          html: `<div class="text-center">
            <i class="bi bi-exclamation-circle-fill text-danger" style="font-size: 3rem;"></i>
            <p class="mt-3">Failed to delete earning. Please try again.</p>
            <small class="text-muted">${
              err.message || "Unknown error occurred"
            }</small>
          </div>`,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545",
          customClass: {
            popup: "swal2-responsive",
            confirmButton: "btn btn-danger px-4",
          },
          buttonsStyling: false,
          width: window.innerWidth < 768 ? "80%" : "24rem",
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  // 🎯 Filters
  const filteredEarnings = useMemo(() => {
    return earnings.filter((e) => {
      let pass = true;
      const earningDate = new Date(e.date);
      if (sourceFilter !== "all" && e.source !== sourceFilter) pass = false;
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
      if (dateRange.from && earningDate < new Date(dateRange.from))
        pass = false;
      if (dateRange.to && earningDate > new Date(dateRange.to)) pass = false;
      return pass;
    });
  }, [earnings, sourceFilter, dateFilter, dateRange]);

  const totalAmount = useMemo(
    () => filteredEarnings.reduce((sum, e) => sum + e.amount, 0),
    [filteredEarnings]
  );

  const partnerTotals = useMemo(() => {
    const totals = {};
    filteredEarnings.forEach((e) => {
      e.partners?.forEach((p) => {
        const id = p.partnerId?._id || p.partnerId;
        if (!totals[id]) {
          totals[id] = { name: p.partnerId?.name || "Partner", amount: 0 };
        }
        totals[id].amount += p.amount || 0;
      });
    });
    return totals;
  }, [filteredEarnings]);

  const partnerPayables = useMemo(() => {
    const payables = {};
    filteredEarnings.forEach((e) => {
      e.partners?.forEach((p) => {
        if (!p.paid) {
          const id = p.partnerId?._id || p.partnerId;
          if (!payables[id]) {
            payables[id] = { name: p.partnerId?.name || "Partner", amount: 0 };
          }
          payables[id].amount += p.amount || 0;
        }
      });
    });
    return payables;
  }, [filteredEarnings]);

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
    <>
      <div className="container my-4">
        {/* Header */}
        <div
          className="card shadow-sm border-0 text-center text-white mb-3"
          style={{
            background: "linear-gradient(135deg, #00b09b, #96c93d)",
            borderRadius: "16px",
          }}
        >
          <div className="card-body p-3 p-md-4">
            <h3 className="fw-bold mb-2">
              <i className="bi bi-cash-coin me-2"></i> Car Earnings Dashboard
            </h3>
            <p className="opacity-75 mb-3">
              Track and manage all your vehicle income
            </p>
            <div
              className="p-2 p-md-3 rounded-3 mx-auto mb-3"
              style={{
                background: "linear-gradient(135deg, #43cea2, #185a9d)",
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
              to={`/add-earning`}
              className="btn btn-light shadow-sm rounded-pill px-4 py-2"
            >
              <i className="bi bi-plus-lg me-1"></i> Add Earning
            </Link>
          </div>
        </div>

        {/* Partner Totals */}
        {Object.keys(partnerTotals).length > 0 && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Partner-wise Earnings Summary</h5>
              <ul className="list-group list-group-flush">
                {Object.values(partnerTotals).map((p, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{p.name}</span>
                    <span className="fw-bold text-success">
                      ₹{Math.round(p.amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Partner Payables */}

        {Object.keys(partnerPayables).length > 0 && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3 text-danger">
                Partner-wise Payable Summary
              </h5>

              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Partner</th>
                      <th scope="col">Payable Amount</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(partnerPayables).map((p, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{p.name}</td>
                        <td className="fw-bold text-danger">
                          ₹{Math.round(p.amount).toLocaleString()}
                        </td>
                        <td>
                          {p.paid ? (
                            <span className="badge bg-success px-3 py-2">
                              Received
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark px-3 py-2">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-light">
                      <td className="fw-bold text-end">Total</td>
                      <td className="fw-bold text-danger">
                        ₹
                        {Object.values(partnerPayables)
                          .reduce((sum, p) => sum + Math.round(p.amount), 0)
                          .toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Earnings List */}
        {filteredEarnings.length > 0 ? (
          <div className="row g-4">
            {filteredEarnings.map((e, index) => (
              <div key={e._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
                <div
                  className="card border-0 shadow-lg h-100"
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
                      style={{
                        width: "70px",
                        height: "70px",
                        marginTop: "15px",
                      }}
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
                      ₹{Math.round(e.amount).toLocaleString()}
                    </h3>

                    {/* Partner Breakdown */}
                    {e.partners && e.partners.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold text-muted">Partners</h6>
                        <ul className="list-unstyled small mb-0">
                          {e.partners.map((p) => {
                            const sharePercentage =
                              Number(e.amount) > 0
                                ? (
                                    (Number(p.amount) / Number(e.amount)) *
                                    100
                                  ).toFixed(1)
                                : 0;
                            return (
                              <li
                                key={p.partnerId?._id || p.partnerId}
                                className="d-flex align-items-center justify-content-between border-bottom py-1"
                              >
                                <div className="text-start">
                                  <strong>
                                    {p.partnerId?.name || "Partner"}
                                  </strong>{" "}
                                  <span className="text-muted">
                                    ({sharePercentage}%)
                                  </span>
                                  <div className="text-muted">
                                    ₹
                                    {Math.round(
                                      Number(p.amount)
                                    ).toLocaleString()}{" "}
                                    {p.paid ? (
                                      <span className="text-success">
                                        {" "}
                                        (Received)
                                      </span>
                                    ) : (
                                      <span className="text-warning">
                                        {" "}
                                        (Pending)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  {p.paid ? (
                                    <span className="badge bg-success">
                                      Received
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
                      </div>
                    )}

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
                      onClick={() => handleDelete(e._id, e.source, e.amount)}
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
      </div>
    </>
  );
}
