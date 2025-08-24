// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function CarSummary() {
//   const { carId } = useParams();
//   const [expenses, setExpenses] = useState([]);
//   const [earnings, setEarnings] = useState([]);
//   const [filteredExpenses, setFilteredExpenses] = useState([]);
//   const [filteredEarnings, setFilteredEarnings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [dateFilter, setDateFilter] = useState("all");
//   const [dateRange, setDateRange] = useState({ from: "", to: "" });

//   const [summary, setSummary] = useState({
//     totalExpenses: 0,
//     totalEarnings: 0,
//     profit: 0,
//   });

//   // Fetch both expenses & earnings
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [expRes, earnRes] = await Promise.all([
//           axios.get(
//             `https://uss-car-manager-f0gv.onrender.com/api/expenses/car/${carId}`
//           ),
//           axios.get(
//             `https://uss-car-manager-f0gv.onrender.com/api/earnings/car/${carId}`
//           ),
//         ]);
//         setExpenses(expRes.data);
//         setEarnings(earnRes.data);
//         setFilteredExpenses(expRes.data);
//         setFilteredEarnings(earnRes.data);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [carId]);

//   // Apply filters
//   useEffect(() => {
//     const now = new Date();

//     const filterByDate = (items) => {
//       let filtered = [...items];

//       if (dateFilter !== "all") {
//         if (dateFilter === "lastWeek") {
//           const lastWeek = new Date();
//           lastWeek.setDate(now.getDate() - 7);
//           filtered = filtered.filter((i) => new Date(i.date) >= lastWeek);
//         } else if (dateFilter === "lastMonth") {
//           const lastMonth = new Date();
//           lastMonth.setMonth(now.getMonth() - 1);
//           filtered = filtered.filter((i) => new Date(i.date) >= lastMonth);
//         } else if (dateFilter === "lastYear") {
//           const lastYear = new Date();
//           lastYear.setFullYear(now.getFullYear() - 1);
//           filtered = filtered.filter((i) => new Date(i.date) >= lastYear);
//         }
//       }

//       if (dateRange.from && dateRange.to) {
//         const fromDate = new Date(dateRange.from);
//         const toDate = new Date(dateRange.to);
//         toDate.setHours(23, 59, 59, 999);

//         filtered = filtered.filter((i) => {
//           const d = new Date(i.date);
//           return d >= fromDate && d <= toDate;
//         });
//       }

//       return filtered;
//     };

//     const filteredExp = filterByDate(expenses);
//     const filteredEarn = filterByDate(earnings);

//     setFilteredExpenses(filteredExp);
//     setFilteredEarnings(filteredEarn);

//     const totalExp = filteredExp.reduce((s, e) => s + e.amount, 0);
//     const totalEarn = filteredEarn.reduce((s, e) => s + e.amount, 0);

//     setSummary({
//       totalExpenses: totalExp,
//       totalEarnings: totalEarn,
//       profit: totalEarn - totalExp,
//     });
//   }, [dateFilter, dateRange, expenses, earnings]);

//   // Handle filter reset logic
//   const handleDateFilterChange = (value) => {
//     setDateFilter(value);
//     setDateRange({ from: "", to: "" }); // reset range when dropdown used
//   };

//   const handleDateRangeChange = (field, value) => {
//     setDateRange((prev) => ({ ...prev, [field]: value }));
//     setDateFilter("all"); // reset dropdown when range is used
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border text-primary"></div>
//         <p className="mt-2">Loading car summary...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-4">
//       {/* Header */}
//       <div
//         className="card shadow-sm border-0 text-center text-white mb-4"
//         style={{
//           background: "linear-gradient(135deg, #1e3c72, #2a5298)",
//           borderRadius: "16px",
//         }}
//       >
//         <div className="card-body p-3 p-md-4">
//           <h3 className="fw-bold mb-2">
//             <i className="bi bi-graph-up-arrow me-2"></i> Car Summary Report
//           </h3>
//           <p className="opacity-75 mb-3">
//             Combined overview of expenses, earnings & profit
//           </p>

//           <div className="row g-3">
//             {/* Expenses */}
//             <div className="col-12 col-md-4">
//               <div
//                 className="p-3 rounded-3 text-white"
//                 style={{
//                   background: "linear-gradient(135deg,#ff4e50,#f9d423)",
//                 }}
//               >
//                 <h6 className="mb-1">
//                   <i className="bi bi-receipt me-1"></i> Expenses
//                 </h6>
//                 <h5 className="fw-bold">
//                   ₹{summary.totalExpenses.toLocaleString()}
//                 </h5>
//               </div>
//             </div>
//             {/* Earnings */}
//             <div className="col-12 col-md-4">
//               <div
//                 className="p-3 rounded-3 text-white"
//                 style={{
//                   background: "linear-gradient(135deg,#56ab2f,#a8e063)",
//                 }}
//               >
//                 <h6 className="mb-1">
//                   <i className="bi bi-cash-coin me-1"></i> Earnings
//                 </h6>
//                 <h5 className="fw-bold">
//                   ₹{summary.totalEarnings.toLocaleString()}
//                 </h5>
//               </div>
//             </div>
//             {/* Profit */}
//             <div className="col-12 col-md-4">
//               <div
//                 className="p-3 rounded-3 text-white"
//                 style={{
//                   background:
//                     summary.profit >= 0
//                       ? "linear-gradient(135deg,#36d1dc,#5b86e5)"
//                       : "linear-gradient(135deg,#ff512f,#dd2476)",
//                 }}
//               >
//                 <h6 className="mb-1">
//                   <i className="bi bi-graph-up me-1"></i> Profit
//                 </h6>
//                 <h5 className="fw-bold">₹{summary.profit.toLocaleString()}</h5>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="card shadow-sm border-0 mb-4">
//         <div className="card-body row g-3">
//           <div className="col-md-4 col-12">
//             <label className="form-label small">Quick Date Filter</label>
//             <select
//               className="form-select rounded-pill"
//               value={dateFilter}
//               onChange={(e) => handleDateFilterChange(e.target.value)}
//             >
//               <option value="all">All</option>
//               <option value="lastWeek">Last Week</option>
//               <option value="lastMonth">Last Month</option>
//               <option value="lastYear">Last Year</option>
//             </select>
//           </div>
//           <div className="col-md-8 col-12">
//             <div className="row g-2">
//               <div className="col-6">
//                 <label className="form-label small">From</label>
//                 <input
//                   type="date"
//                   className="form-control rounded-pill"
//                   value={dateRange.from}
//                   onChange={(e) =>
//                     handleDateRangeChange("from", e.target.value)
//                   }
//                 />
//               </div>
//               <div className="col-6">
//                 <label className="form-label small">To</label>
//                 <input
//                   type="date"
//                   className="form-control rounded-pill"
//                   value={dateRange.to}
//                   onChange={(e) => handleDateRangeChange("to", e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Summary Lists */}
//       <div className="row g-4">
//         <div className="col-md-6">
//           <h5 className="fw-bold mb-3">
//             <i className="bi bi-cash-stack me-2 text-success"></i>Earnings
//           </h5>
//           {filteredEarnings.length > 0 ? (
//             <ul className="list-group shadow-sm">
//               {filteredEarnings.map((e) => (
//                 <li
//                   key={e._id}
//                   className="list-group-item d-flex justify-content-between"
//                 >
//                   <span>
//                     {new Date(e.date).toLocaleDateString()} -{" "}
//                     {e.notes || "Earning"}
//                   </span>
//                   <b className="text-success">₹{e.amount.toLocaleString()}</b>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-muted">No earnings found.</p>
//           )}
//         </div>

//         <div className="col-md-6">
//           <h5 className="fw-bold mb-3">
//             <i className="bi bi-receipt me-2 text-danger"></i>Expenses
//           </h5>
//           {filteredExpenses.length > 0 ? (
//             <ul className="list-group shadow-sm">
//               {filteredExpenses.map((e) => (
//                 <li
//                   key={e._id}
//                   className="list-group-item d-flex justify-content-between"
//                 >
//                   <span>
//                     {new Date(e.date).toLocaleDateString()} -{" "}
//                     {e.notes || "Expense"}
//                   </span>
//                   <b className="text-danger">₹{e.amount.toLocaleString()}</b>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-muted">No expenses found.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CarSummary() {
  const { carId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalEarnings: 0,
    profit: 0,
  });

  // Fetch both expenses & earnings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expRes, earnRes] = await Promise.all([
          axios.get(
            `https://uss-car-manager-f0gv.onrender.com/api/expenses/car/${carId}`
          ),
          axios.get(
            `https://uss-car-manager-f0gv.onrender.com/api/earnings/car/${carId}`
          ),
        ]);
        setExpenses(expRes.data);
        setEarnings(earnRes.data);
        setFilteredExpenses(expRes.data);
        setFilteredEarnings(earnRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId]);

  // Apply filters
  useEffect(() => {
    const now = new Date();

    const filterByDate = (items) => {
      let filtered = [...items];

      if (dateFilter !== "all") {
        if (dateFilter === "lastWeek") {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          filtered = filtered.filter((i) => new Date(i.date) >= lastWeek);
        } else if (dateFilter === "lastMonth") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((i) => new Date(i.date) >= lastMonth);
        } else if (dateFilter === "lastYear") {
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter((i) => new Date(i.date) >= lastYear);
        }
      }

      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);

        filtered = filtered.filter((i) => {
          const d = new Date(i.date);
          return d >= fromDate && d <= toDate;
        });
      }

      return filtered;
    };

    const filteredExp = filterByDate(expenses);
    const filteredEarn = filterByDate(earnings);

    setFilteredExpenses(filteredExp);
    setFilteredEarnings(filteredEarn);

    const totalExp = filteredExp.reduce((s, e) => s + e.amount, 0);
    const totalEarn = filteredEarn.reduce((s, e) => s + e.amount, 0);

    setSummary({
      totalExpenses: totalExp,
      totalEarnings: totalEarn,
      profit: totalEarn - totalExp,
    });
  }, [dateFilter, dateRange, expenses, earnings]);

  // Handle filter reset logic
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setDateRange({ from: "", to: "" });
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setDateFilter("all");
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading car summary...</h5>
          <p className="text-muted small">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8fafc" }}>
      <div className="container-fluid px-3 px-md-4 py-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="card border-0 shadow-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                borderRadius: "20px",
              }}
            >
              <div className="card-body p-3 p-md-5">
                {/* Header */}
                <div className="text-center text-white mb-3 mb-md-5">
                  <div className="mb-2 mb-md-3">
                    <i
                      className="bi bi-car-front-fill"
                      style={{ fontSize: "2.5rem", opacity: "0.9" }}
                    ></i>
                  </div>
                  <h2 className="fw-bold mb-1 mb-md-2 fs-5 fs-md-2">
                    Car Financial Summary
                  </h2>
                  <p className="opacity-75 mb-0 small">
                    Comprehensive overview of your car's financial performance
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="row g-2 g-md-4">
                  {/* Expenses Card */}
                  <div className="col-12 col-sm-6 col-lg-4">
                    <div
                      className="card border-0 h-100 shadow-sm transition-transform hover-lift"
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        borderLeft: "6px solid #ef4444",
                      }}
                    >
                      <div className="card-body p-3 text-dark">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <i className="bi bi-receipt fs-4 text-red-500"></i>
                          <span className="badge bg-red-100 text-red-800 fw-normal rounded-pill small">
                            Expenses
                          </span>
                        </div>
                        <h6
                          className="text-uppercase text-muted fw-bold mb-1 card-title-mobile"
                          style={{ letterSpacing: "1px" }}
                        >
                          Total Expenses
                        </h6>
                        <h4 className="fw-bold mb-0 fs-5 fs-md-3">
                          ₹{summary.totalExpenses.toLocaleString("en-IN")}
                        </h4>
                        <small className="text-muted mt-2 d-block card-text-mobile">
                          {filteredExpenses.length} transactions
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Card */}
                  <div className="col-12 col-sm-6 col-lg-4">
                    <div
                      className="card border-0 h-100 shadow-sm transition-transform hover-lift"
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        borderLeft: "6px solid #22c55e",
                      }}
                    >
                      <div className="card-body p-3 text-dark">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <i className="bi bi-cash-coin fs-4 text-green-500"></i>
                          <span className="badge bg-green-100 text-green-800 fw-normal rounded-pill small">
                            Earnings
                          </span>
                        </div>
                        <h6
                          className="text-uppercase text-muted fw-bold mb-1 card-title-mobile"
                          style={{ letterSpacing: "1px" }}
                        >
                          Total Earnings
                        </h6>
                        <h4 className="fw-bold mb-0 fs-5 fs-md-3">
                          ₹{summary.totalEarnings.toLocaleString("en-IN")}
                        </h4>
                        <small className="text-muted mt-2 d-block card-text-mobile">
                          {filteredEarnings.length} transactions
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Profit/Loss Card */}
                  <div className="col-12 col-sm-12 col-lg-4">
                    <div
                      className="card border-0 h-100 shadow-sm transition-transform hover-lift"
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        borderLeft: `6px solid ${
                          summary.profit >= 0 ? "#3b82f6" : "#f59e0b"
                        }`,
                      }}
                    >
                      <div className="card-body p-3 text-dark">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <i
                            className={`bi ${
                              summary.profit >= 0
                                ? "bi-graph-up"
                                : "bi-graph-down"
                            } fs-4 ${
                              summary.profit >= 0
                                ? "text-blue-500"
                                : "text-yellow-500"
                            }`}
                          ></i>
                          <span
                            className={`badge ${
                              summary.profit >= 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            } fw-normal rounded-pill small`}
                          >
                            {summary.profit >= 0 ? "Profit" : "Loss"}
                          </span>
                        </div>
                        <h6
                          className="text-uppercase text-muted fw-bold mb-1 card-title-mobile"
                          style={{ letterSpacing: "1px" }}
                        >
                          Net {summary.profit >= 0 ? "Profit" : "Loss"}
                        </h6>
                        <h4 className="fw-bold mb-0 fs-5 fs-md-3">
                          ₹{Math.abs(summary.profit).toLocaleString("en-IN")}
                        </h4>
                        <small className="text-muted mt-2 d-block card-text-mobile">
                          {summary.profit >= 0 ? "Positive" : "Negative"}{" "}
                          balance
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style jsx>
              {`
                .transition-transform {
                  transition: transform 0.3s ease-in-out;
                }

                .hover-lift:hover {
                  transform: translateY(-8px);
                }

                .bg-red-100 {
                  background-color: #fee2e2;
                }
                .text-red-800 {
                  color: #991b1b;
                }
                .text-red-500 {
                  color: #ef4444;
                }

                .bg-green-100 {
                  background-color: #dcfce7;
                }
                .text-green-800 {
                  color: #14532d;
                }
                .text-green-500 {
                  color: #22c55e;
                }

                .bg-blue-100 {
                  background-color: #dbeafe;
                }
                .text-blue-800 {
                  color: #1e40af;
                }
                .text-blue-500 {
                  color: #3b82f6;
                }

                .bg-yellow-100 {
                  background-color: #fef9c3;
                }
                .text-yellow-800 {
                  color: #92400e;
                }
                .text-yellow-500 {
                  color: #f59e0b;
                }

                @media (max-width: 767px) {
                  .card-body {
                    padding: 1.5rem !important; /* Reduce padding to decrease height */
                  }

                  h4.fs-5 {
                    font-size: 1.25rem !important;
                  }

                  .card-title-mobile {
                    font-size: 0.7rem !important;
                  }

                  .card-text-mobile {
                    font-size: 0.75rem !important;
                  }

                  .bi {
                    font-size: 1.5rem !important; /* Smaller icon size */
                  }

                  .badge.small {
                    font-size: 0.6rem !important;
                    padding: 0.25em 0.5em;
                  }
                }
              `}
            </style>

            <style jsx>
              {`
                .transition-transform {
                  transition: transform 0.3s ease-in-out;
                }

                .hover-lift:hover {
                  transform: translateY(-8px);
                }

                .bg-red-100 {
                  background-color: #fee2e2;
                }
                .text-red-800 {
                  color: #991b1b;
                }
                .text-red-500 {
                  color: #ef4444;
                }

                .bg-green-100 {
                  background-color: #dcfce7;
                }
                .text-green-800 {
                  color: #14532d;
                }
                .text-green-500 {
                  color: #22c55e;
                }

                .bg-blue-100 {
                  background-color: #dbeafe;
                }
                .text-blue-800 {
                  color: #1e40af;
                }
                .text-blue-500 {
                  color: #3b82f6;
                }

                .bg-yellow-100 {
                  background-color: #fef9c3;
                }
                .text-yellow-800 {
                  color: #92400e;
                }
                .text-yellow-500 {
                  color: #f59e0b;
                }
              `}
            </style>
          </div>
        </div>

        {/* Filters Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-funnel me-2 text-primary"></i>
                  Filters
                </h5>
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold small text-muted">
                      Quick Date Filter
                    </label>
                    <select
                      className="form-select border-0 shadow-sm"
                      style={{
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        fontSize: "0.95rem",
                      }}
                      value={dateFilter}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="lastWeek">Last 7 Days</option>
                      <option value="lastMonth">Last 30 Days</option>
                      <option value="lastYear">Last Year</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-8">
                    <label className="form-label fw-semibold small text-muted">
                      Custom Date Range
                    </label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control border-0 shadow-sm"
                          style={{
                            borderRadius: "12px",
                            backgroundColor: "#f8fafc",
                            fontSize: "0.9rem",
                          }}
                          value={dateRange.from}
                          onChange={(e) =>
                            handleDateRangeChange("from", e.target.value)
                          }
                          placeholder="From date"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control border-0 shadow-sm"
                          style={{
                            borderRadius: "12px",
                            backgroundColor: "#f8fafc",
                            fontSize: "0.9rem",
                          }}
                          value={dateRange.to}
                          onChange={(e) =>
                            handleDateRangeChange("to", e.target.value)
                          }
                          placeholder="To date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Lists */}
        <div className="row g-4">
          {/* Earnings List */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-0">
                <div
                  className="p-4 border-bottom"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <h5 className="fw-bold mb-0 d-flex align-items-center">
                    <i className="bi bi-cash-stack me-2 text-success"></i>
                    Earnings
                    <span className="badge bg-success ms-2 rounded-pill">
                      {filteredEarnings.length}
                    </span>
                  </h5>
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredEarnings.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {filteredEarnings.map((earning, index) => (
                        <div
                          key={earning._id}
                          className="list-group-item border-0 py-3 px-4"
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#fff" : "#f8fafc",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <i className="bi bi-calendar3 me-2 text-muted small"></i>
                                <small className="text-muted fw-medium">
                                  {new Date(earning.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </small>
                              </div>
                              <p className="mb-0 fw-medium">
                                {earning.notes || "Earning Transaction"}
                              </p>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-pill">
                                +₹{earning.amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i
                        className="bi bi-inbox text-muted mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <p className="text-muted mb-0">
                        No earnings found for selected period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-0">
                <div
                  className="p-4 border-bottom"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <h5 className="fw-bold mb-0 d-flex align-items-center">
                    <i className="bi bi-receipt me-2 text-danger"></i>
                    Expenses
                    <span className="badge bg-danger ms-2 rounded-pill">
                      {filteredExpenses.length}
                    </span>
                  </h5>
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredExpenses.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {filteredExpenses.map((expense, index) => {
                        console.log(expense);

                        return (
                          <div
                            key={expense._id}
                            className="list-group-item border-0 py-3 px-4"
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#fff" : "#f8fafc",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                  <i className="bi bi-calendar3 me-2 text-muted small"></i>
                                  <small className="text-muted fw-medium">
                                    {new Date(expense.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </small>
                                </div>
                                <p className="mb-0 fw-medium">
                                  {expense.category || "Expense Transaction"}
                                </p>
                              </div>
                              <div className="text-end">
                                <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-2 rounded-pill">
                                  -₹{expense.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i
                        className="bi bi-inbox text-muted mb-3"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <p className="text-muted mb-0">
                        No expenses found for selected period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
