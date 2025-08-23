// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";

// export default function ExpenseList() {
//   const { carId } = useParams();
//   const [expenses, setExpenses] = useState([]);
//   const [filteredExpenses, setFilteredExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [dateRange, setDateRange] = useState({
//     from: "",
//     to: "",
//   });
//   // Filters
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [dateFilter, setDateFilter] = useState("all"); // all | lastWeek |

//   // Fetch Expenses
//   useEffect(() => {
//     const fetchExpenses = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `http://localhost:5000/api/expenses/car/${carId}`
//         );
//         setExpenses(res.data);
//         setFilteredExpenses(res.data);

//         const total = res.data.reduce((sum, exp) => sum + exp.amount, 0);
//         setTotalAmount(total);
//       } catch (err) {
//         console.error("Error fetching expenses:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExpenses();
//   }, [carId]);

//   // Apply filters
//   useEffect(() => {
//     let filtered = [...expenses];
//     const now = new Date();

//     // Category filter
//     if (categoryFilter !== "all") {
//       filtered = filtered.filter(
//         (exp) => exp.category?.toLowerCase() === categoryFilter
//       );
//     }

//     // Date filter (quick selects)
//     if (dateFilter === "lastWeek") {
//       const lastWeek = new Date();
//       lastWeek.setDate(now.getDate() - 7);
//       filtered = filtered.filter((exp) => new Date(exp.date) >= lastWeek);
//     } else if (dateFilter === "lastMonth") {
//       const lastMonth = new Date();
//       lastMonth.setMonth(now.getMonth() - 1);
//       filtered = filtered.filter((exp) => new Date(exp.date) >= lastMonth);
//     } else if (dateFilter === "lastYear") {
//       const lastYear = new Date();
//       lastYear.setFullYear(now.getFullYear() - 1);
//       filtered = filtered.filter((exp) => new Date(exp.date) >= lastYear);
//     }

//     // Always apply date range
//     if (dateRange.from && dateRange.to) {
//       const fromDate = new Date(dateRange.from);
//       const toDate = new Date(dateRange.to);
//       toDate.setHours(23, 59, 59, 999);

//       filtered = filtered.filter((exp) => {
//         const expDate = new Date(exp.date);
//         return expDate >= fromDate && expDate <= toDate;
//       });
//     }

//     setFilteredExpenses(filtered);
//     setTotalAmount(filtered.reduce((sum, exp) => sum + exp.amount, 0));
//   }, [categoryFilter, dateFilter, dateRange, expenses]);

//   // Delete Expense
//   const handleDelete = async (expenseId) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "This expense will be permanently deleted!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       setDeleting(expenseId);
//       await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`);
//       const updatedExpenses = expenses.filter((exp) => exp._id !== expenseId);
//       setExpenses(updatedExpenses);
//       Swal.fire("Deleted!", "Expense has been deleted.", "success");
//     } catch (err) {
//       console.error("Error deleting expense:", err);
//       Swal.fire("Error!", "Failed to delete expense.", "error");
//     } finally {
//       setDeleting(null);
//     }
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       fuel: "bi-fuel-pump-fill",
//       maintenance: "bi-wrench",
//       insurance: "bi-shield-fill-check",
//       repair: "bi-hammer",
//       parking: "bi-p-square-fill",
//       toll: "bi-coin",
//       cleaning: "bi-droplet-fill",
//       other: "bi-three-dots",
//     };
//     return icons[category?.toLowerCase()] || "bi-receipt";
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       fuel: "#FF6B35",
//       maintenance: "#4ECDC4",
//       insurance: "#45B7D1",
//       repair: "#F7931E",
//       parking: "#96CEB4",
//       toll: "#FECA57",
//       cleaning: "#48CAE4",
//       other: "#6C5CE7",
//     };
//     return colors[category?.toLowerCase()] || "#667eea";
//   };

//   const getCategoryGradient = (category) => {
//     const gradients = {
//       fuel: "linear-gradient(135deg, #FF6B35, #F7931E)",
//       maintenance: "linear-gradient(135deg, #4ECDC4, #44A08D)",
//       insurance: "linear-gradient(135deg, #45B7D1, #96C93D)",
//       repair: "linear-gradient(135deg, #F7931E, #FF6B35)",
//       parking: "linear-gradient(135deg, #96CEB4, #FFECD2)",
//       toll: "linear-gradient(135deg, #FECA57, #FF9A9E)",
//       cleaning: "linear-gradient(135deg, #48CAE4, #007EA7)",
//       other: "linear-gradient(135deg, #6C5CE7, #A777E3)",
//     };
//     return (
//       gradients[category?.toLowerCase()] ||
//       "linear-gradient(135deg, #667eea, #764ba2)"
//     );
//   };

//   if (loading) {
//     return (
//       <div className="container mt-5 text-center">
//         <div
//           className="spinner-border text-primary mb-3"
//           style={{ width: "3rem", height: "3rem" }}
//           role="status"
//         />
//         <h5 className="text-muted">Loading your expenses...</h5>
//         <p className="text-secondary">Please wait while we fetch your data</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-4">
//       {/* Header */}
//       <div className="row mb-4">
//         <div className="col-12">
//           <div
//             className="card bg-gradient shadow-lg border-0"
//             style={{
//               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//             }}
//           >
//             <div className="card-body text-white text-center p-4">
//               <h2 className="fw-bold mb-2 fs-3 fs-md-2">
//                 <i className="bi bi-car-front-fill me-2"></i> Car Expenses
//                 Dashboard
//               </h2>
//               <p className="mb-3 opacity-75 fs-6 fs-md-5">
//                 Track and manage all your vehicle-related expenses
//               </p>

//               {/* Total Expenses Box */}
//               <div
//                 className="p-3 mb-3 rounded-3 d-inline-block text-white"
//                 style={{
//                   background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
//                   minWidth: "200px",
//                 }}
//               >
//                 <h6 className="mb-1 fs-6">Total Expenses</h6>
//                 <h3 className="mb-0 fw-bold fs-4 fs-md-3">
//                   ₹{totalAmount.toLocaleString()}
//                 </h3>
//               </div>

//               {/* Add Expense Button */}
//               <div>
//                 <Link
//                   to="/add-expense"
//                   className="btn btn-light btn-md shadow-sm mt-2"
//                 >
//                   <i className="bi bi-plus-lg me-2"></i>Add New Expense
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="row mb-4">
//         <div className="col-12">
//           <div className="card shadow-sm border-0">
//             <div className="card-body row g-3 align-items-end">
//               {/* Category filter */}
//               <div className="col-md-4 col-12">
//                 <label className="form-label small">Category</label>
//                 <select
//                   className="form-select"
//                   value={categoryFilter}
//                   onChange={(e) => setCategoryFilter(e.target.value)}
//                 >
//                   <option value="all">All</option>
//                   <option value="fuel">Fuel</option>
//                   <option value="service">Service</option>
//                   <option value="insurance">Insurance</option>
//                   <option value="tax">Tax</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               {/* Quick Date Filter */}
//               <div className="col-md-4 col-12">
//                 <label className="form-label small">Quick Date Filter</label>
//                 <select
//                   className="form-select"
//                   value={dateFilter}
//                   onChange={(e) => setDateFilter(e.target.value)}
//                 >
//                   <option value="all">All</option>
//                   <option value="lastWeek">Last Week</option>
//                   <option value="lastMonth">Last Month</option>
//                   <option value="lastYear">Last Year</option>
//                 </select>
//               </div>

//               {/* Date Range Filter */}
//               <div className="col-md-4 col-12">
//                 <div className="row g-2">
//                   <div className="col-md-6 col-12">
//                     <label className="form-label small">From</label>
//                     <input
//                       type="date"
//                       className="form-control"
//                       value={dateRange.from || ""}
//                       onChange={(e) =>
//                         setDateRange({ ...dateRange, from: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div className="col-md-6 col-12">
//                     <label className="form-label small">To</label>
//                     <input
//                       type="date"
//                       className="form-control"
//                       value={dateRange.to || ""}
//                       onChange={(e) =>
//                         setDateRange({ ...dateRange, to: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Expenses Grid */}
//       {filteredExpenses.length > 0 ? (
//         <div className="row g-4">
//           {filteredExpenses.map((exp, index) => (
//             <div key={exp._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
//               <div
//                 className="card expense-card border-0 h-100 overflow-hidden position-relative"
//                 style={{
//                   animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
//                   borderRadius: "20px",
//                   background: "white",
//                   boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 {/* Gradient Header */}
//                 <div
//                   className="position-relative"
//                   style={{
//                     background: getCategoryGradient(exp.category),
//                     height: "120px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   {/* Decorative circles */}
//                   <div
//                     className="position-absolute"
//                     style={{
//                       top: "-30px",
//                       right: "-30px",
//                       width: "80px",
//                       height: "80px",
//                       background: "rgba(255,255,255,0.1)",
//                       borderRadius: "50%",
//                     }}
//                   ></div>
//                   <div
//                     className="position-absolute"
//                     style={{
//                       bottom: "-20px",
//                       left: "-20px",
//                       width: "50px",
//                       height: "50px",
//                       background: "rgba(255,255,255,0.1)",
//                       borderRadius: "50%",
//                     }}
//                   ></div>

//                   {/* Icon */}
//                   <div
//                     className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center position-relative"
//                     style={{
//                       width: "70px",
//                       height: "70px",
//                       zIndex: 2,
//                     }}
//                   >
//                     <i
//                       className={`${getCategoryIcon(exp.category)} fs-3`}
//                       style={{ color: getCategoryColor(exp.category) }}
//                     ></i>
//                   </div>
//                 </div>

//                 {/* Card Content */}
//                 <div
//                   className="card-body p-4 text-center position-relative"
//                   style={{ marginTop: "-25px" }}
//                 >
//                   {/* White curved separator */}
//                   <div
//                     className="position-absolute w-100"
//                     style={{
//                       top: "0",
//                       left: "0",
//                       height: "25px",
//                       background: "white",
//                       borderRadius: "25px 25px 0 0",
//                     }}
//                   ></div>

//                   <div className="pt-3">
//                     {/* Category Title */}
//                     <h5
//                       className="mb-2 fw-bold text-capitalize"
//                       style={{ color: "#2d3748", fontSize: "1.1rem" }}
//                     >
//                       {exp.category}
//                     </h5>

//                     {/* Date with styled background */}
//                     <div
//                       className="d-inline-flex align-items-center px-3 py-1 rounded-pill mb-3"
//                       style={{
//                         backgroundColor: "rgba(102, 126, 234, 0.1)",
//                         color: "#667eea",
//                         fontSize: "0.85rem",
//                       }}
//                     >
//                       <i className="bi bi-calendar3 me-2"></i>
//                       {new Date(exp.date).toLocaleDateString("en-IN", {
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                       })}
//                     </div>

//                     {/* Amount */}
//                     <div className="mb-3">
//                       <h3
//                         className="fw-bold mb-2"
//                         style={{
//                           fontSize: "2rem",
//                           background: getCategoryGradient(exp.category),
//                           WebkitBackgroundClip: "text",
//                           WebkitTextFillColor: "transparent",
//                           backgroundClip: "text",
//                         }}
//                       >
//                         ₹{exp.amount.toLocaleString()}
//                       </h3>

//                       {/* Notes with better styling */}
//                       <div
//                         className="p-3 rounded-3 text-start"
//                         style={{
//                           backgroundColor: "#f8fafc",
//                           border: "1px solid #e2e8f0",
//                         }}
//                       >
//                         <p
//                           className="mb-0 text-muted"
//                           style={{ fontSize: "0.9rem", lineHeight: "1.5" }}
//                         >
//                           <i className="bi bi-chat-square-text me-2 text-secondary"></i>
//                           {exp.notes ||
//                             "No additional notes provided for this expense."}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Enhanced Footer */}
//                 <div className="card-footer bg-transparent border-0 p-4 pt-0">
//                   <div className="d-flex gap-2">
//                     <Link
//                       to={`/edit-expense/${exp._id}`}
//                       className="btn flex-fill edit-btn"
//                       style={{
//                         background: "linear-gradient(135deg, #667eea, #764ba2)",
//                         border: "none",
//                         color: "white",
//                         borderRadius: "12px",
//                         padding: "12px",
//                         fontWeight: "500",
//                         transition: "all 0.3s ease",
//                       }}
//                     >
//                       <i className="bi bi-pencil-square me-2"></i>Edit
//                     </Link>
//                     <button
//                       onClick={() => handleDelete(exp._id)}
//                       disabled={deleting === exp._id}
//                       className="btn flex-fill delete-btn"
//                       style={{
//                         background:
//                           deleting === exp._id
//                             ? "linear-gradient(135deg, #fca5a5, #f87171)"
//                             : "linear-gradient(135deg, #ef4444, #dc2626)",
//                         border: "none",
//                         color: "white",
//                         borderRadius: "12px",
//                         padding: "12px",
//                         fontWeight: "500",
//                         transition: "all 0.3s ease",
//                       }}
//                     >
//                       {deleting === exp._id ? (
//                         <>
//                           <span
//                             className="spinner-border spinner-border-sm me-2"
//                             role="status"
//                           ></span>
//                           Deleting...
//                         </>
//                       ) : (
//                         <>
//                           <i className="bi bi-trash3 me-2"></i>Delete
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         // Empty state
//         <div className="text-center py-5">
//           <div
//             className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
//             style={{
//               width: "120px",
//               height: "120px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               color: "white",
//             }}
//           >
//             <i className="bi bi-receipt" style={{ fontSize: "3rem" }}></i>
//           </div>
//           <h4 className="text-muted mt-3">No Expenses Found</h4>
//           <p className="text-secondary">
//             No expenses match your filters. Try changing category/date range.
//           </p>
//         </div>
//       )}

//       {/* Enhanced Custom CSS */}
//       <style jsx>{`
//         @keyframes slideInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .expense-card {
//           transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//           cursor: pointer;
//         }

//         .expense-card:hover {
//           transform: translateY(-15px) scale(1.02);
//           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
//         }

//         .edit-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//         }

//         .delete-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
//         }

//         .form-select:focus,
//         .form-control:focus {
//           border-color: #667eea;
//           box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
//         }

//         .btn {
//           transition: all 0.3s ease;
//         }

//         /* Glassmorphism effect for cards */
//         .expense-card::before {
//           content: "";
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: linear-gradient(
//             135deg,
//             rgba(255, 255, 255, 0.1),
//             rgba(255, 255, 255, 0)
//           );
//           border-radius: 20px;
//           pointer-events: none;
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }

//         .expense-card:hover::before {
//           opacity: 1;
//         }

//         /* Smooth hover animation for the entire card */
//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0px);
//           }
//           50% {
//             transform: translateY(-5px);
//           }
//         }

//         .expense-card:hover {
//           animation: float 2s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

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
      <div
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
