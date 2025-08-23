// // export default AddExpense;
// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";

// const AddExpense = () => {
//   const [cars, setCars] = useState([]);
//   const [car, setCar] = useState("");
//   const [date, setDate] = useState("");
//   const [category, setCategory] = useState("");
//   const [customCategory, setCustomCategory] = useState("");
//   const [amount, setAmount] = useState("");
//   const [notes, setNotes] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCars = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/cars");
//         setCars(res.data);
//       } catch (err) {
//         console.error("Error fetching cars:", err);
//       }
//     };
//     fetchCars();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!car) {
//       alert("Please select a car");
//       return;
//     }
//     const finalCategory = category === "Others" ? customCategory : category;
//     try {
//       await axios.post("http://localhost:5000/api/expenses", {
//         car,
//         date,
//         category: finalCategory,
//         amount,
//         notes,
//       });
//       navigate(`/expenses/${car}`);
//     } catch (err) {
//       console.error("Error adding expense:", err);
//     }
//   };

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
//               <h2 className="mb-2 fw-bold">
//                 <i className="bi bi-plus-circle me-2"></i> Add New Expense
//               </h2>
//               <p className="mb-0 opacity-75">
//                 Record and track your car-related spending easily
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="row justify-content-center">
//         <div className="col-lg-8 col-md-10 col-12">
//           <div className="card shadow-sm border-0">
//             <div className="card-body p-4">
//               <h4 className="fw-bold mb-4 text-center">
//                 <i className="bi bi-receipt me-2"></i> Expense Details
//               </h4>

//               <form onSubmit={handleSubmit} className="row g-3">
//                 {/* Car */}
//                 <div className="col-md-6 col-12">
//                   <label className="form-label">Select Car</label>
//                   <select
//                     className="form-select"
//                     value={car}
//                     onChange={(e) => setCar(e.target.value)}
//                     required
//                   >
//                     <option value="">-- Select Car --</option>
//                     {cars.map((c) => (
//                       <option key={c._id} value={c._id}>
//                         {c.carName} ({c.carNumber})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Date */}
//                 <div className="col-md-6 col-12">
//                   <label className="form-label">Date</label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     required
//                   />
//                 </div>

//                 {/* Category */}
//                 <div className="col-md-6 col-12">
//                   <label className="form-label">Category</label>
//                   <select
//                     className="form-select"
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     required
//                   >
//                     <option value="">-- Select Category --</option>
//                     <option value="Fuel">Fuel</option>
//                     <option value="Service">Service</option>
//                     <option value="Insurance">Insurance</option>
//                     <option value="Tax">Tax</option>
//                     <option value="Others">Others</option>
//                   </select>
//                 </div>

//                 {/* Custom Category */}
//                 {category === "Others" && (
//                   <div className="col-md-6 col-12">
//                     <label className="form-label">Specify Category</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={customCategory}
//                       onChange={(e) => setCustomCategory(e.target.value)}
//                       required
//                     />
//                   </div>
//                 )}

//                 {/* Amount */}
//                 <div className="col-md-6 col-12">
//                   <label className="form-label">Amount</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     required
//                   />
//                 </div>

//                 {/* Notes */}
//                 <div className="col-md-6 col-12">
//                   <label className="form-label">Notes</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                   />
//                 </div>

//                 {/* Buttons */}
//                 <div className="col-12 mt-3 d-grid gap-2">
//                   <button type="submit" className="btn btn-success py-2">
//                     💾 Save Expense
//                   </button>
//                   <Link to="/" className="btn btn-outline-secondary py-2">
//                     ⬅ Back to Dashboard
//                   </Link>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Responsive CSS */}
//       <style jsx>{`
//         .btn {
//           transition: all 0.2s ease;
//         }
//         .btn:hover {
//           transform: translateY(-1px);
//         }
//         .bg-gradient {
//           background: linear-gradient(
//             135deg,
//             #667eea 0%,
//             #764ba2 100%
//           ) !important;
//         }
//         @media (max-width: 576px) {
//           h2 {
//             font-size: 1.5rem;
//           }
//           h4 {
//             font-size: 1.2rem;
//           }
//           .card-body {
//             padding: 1rem !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AddExpense;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddExpense = () => {
  const [cars, setCars] = useState([]);
  const [expense, setExpense] = useState({
    car: "",
    date: "",
    category: "",
    customCategory: "",
    amount: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cars");
        setCars(res.data);
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const finalCategory =
      expense.category === "Others" ? expense.customCategory : expense.category;

    try {
      await axios.post("http://localhost:5000/api/expenses", {
        car: expense.car,
        date: expense.date,
        category: finalCategory,
        amount: expense.amount,
        notes: expense.notes,
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

      {/* Main Form Card */}
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10 col-12">
          <div
            className="card border-0 shadow-lg"
            style={{
              borderRadius: "18px",
              animation: "fadeUp 0.4s ease-out",
            }}
          >
            <div
              className="card-header border-0 text-center"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "18px 18px 0 0",
              }}
            >
              {/* <div
                className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                style={{ width: "70px", height: "70px", marginTop: "15px" }}
              >
                <i
                  className="bi bi-receipt fs-3"
                  style={{ color: "#667eea" }}
                ></i>
              </div> */}
              <div
                className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                style={{
                  width: "70px",
                  height: "70px",
                  marginTop: "15px",
                }}
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
                  {/* Car Select */}
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
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
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
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
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
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
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
                        style={{
                          borderColor: "#e0e7ff",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#667eea")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-dollar me-2 text-primary"></i>
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.amount}
                      onChange={handleChange}
                      required
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
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
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                    />
                  </div>

                  {/* Progress Summary */}
                  {(expense.car ||
                    expense.date ||
                    expense.category ||
                    expense.amount ||
                    expense.notes) && (
                    <div className="col-12">
                      <div
                        className="card border-0 shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                          borderRadius: "15px",
                        }}
                      >
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-primary mb-2">
                            <i className="bi bi-list-check me-2"></i>Form
                            Progress
                          </h6>
                          <div className="row g-2">
                            {expense.car && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Car Selected
                                </small>
                              </div>
                            )}
                            {expense.date && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Date Set
                                </small>
                              </div>
                            )}
                            {expense.category && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Category Chosen
                                </small>
                              </div>
                            )}
                            {expense.amount && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Amount Entered
                                </small>
                              </div>
                            )}
                            {expense.notes && (
                              <div className="col-12">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Notes Added
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                        transition: "all 0.3s ease",
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </span>
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

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        }
        .card:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AddExpense;
