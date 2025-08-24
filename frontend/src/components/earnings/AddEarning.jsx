// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// export default function AddEarning() {
//   const navigate = useNavigate();
//   const { carId } = useParams(); // 👈 optional carId from URL

//   const [cars, setCars] = useState([]); // all cars
//   const [earning, setEarning] = useState({
//     car: carId || "", // default carId if passed
//     date: "",
//     source: "",
//     amount: "",
//     notes: "",
//   });

//   const [saving, setSaving] = useState(false);

//   // Fetch cars for dropdown
//   useEffect(() => {
//     const fetchCars = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/cars");
//         setCars(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchCars();
//   }, []);

//   const handleChange = (e) => {
//     setEarning({ ...earning, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await axios.post("http://localhost:5000/api/earnings", earning);
//       navigate(`/earnings/${earning.car}`);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add earning");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="container my-4">
//       {/* Header */}
//       <div
//         className="card shadow-lg border-0 text-center text-white mb-4"
//         style={{
//           background: "linear-gradient(135deg, #00b09b, #96c93d)",
//           borderRadius: "20px",
//         }}
//       >
//         <div className="card-body p-4">
//           <h2 className="fw-bold mb-2">
//             <i className="bi bi-cash-coin me-2"></i>Add New Earning
//           </h2>
//           <p className="opacity-75">Record your vehicle’s income</p>
//         </div>
//       </div>

//       {/* Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="card shadow-sm border-0 p-4"
//         style={{ borderRadius: "18px" }}
//       >
//         {/* Car selection */}
//         <div className="mb-3">
//           <label className="form-label">Select Car</label>
//           <select
//             name="car"
//             className="form-select rounded-pill"
//             value={earning.car}
//             onChange={handleChange}
//             required
//           >
//             <option value="">-- Choose a Car --</option>
//             {cars.map((car) => (
//               <option key={car._id} value={car._id}>
//                 {car.name} ({car.registrationNumber})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Date */}
//         <div className="mb-3">
//           <label className="form-label">Date</label>
//           <input
//             type="date"
//             name="date"
//             className="form-control rounded-pill"
//             value={earning.date}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* Source */}
//         <div className="mb-3">
//           <label className="form-label">Source</label>
//           <select
//             name="source"
//             className="form-select rounded-pill"
//             value={earning.source}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Source</option>
//             <option value="trip">Trip</option>
//             <option value="rent">Rent</option>
//             <option value="bonus">Bonus</option>
//             <option value="other">Other</option>
//           </select>
//         </div>

//         {/* Amount */}
//         <div className="mb-3">
//           <label className="form-label">Amount (₹)</label>
//           <input
//             type="number"
//             name="amount"
//             className="form-control rounded-pill"
//             value={earning.amount}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* Notes */}
//         <div className="mb-3">
//           <label className="form-label">Notes</label>
//           <textarea
//             name="notes"
//             className="form-control rounded"
//             rows="3"
//             value={earning.notes}
//             onChange={handleChange}
//           ></textarea>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={saving}
//           className="btn btn-success w-100 rounded-pill shadow-sm"
//         >
//           {saving ? "Saving..." : "Add Earning"}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddEarning = () => {
  const [cars, setCars] = useState([]);
  const [earning, setEarning] = useState({
    car: "",
    date: "",
    source: "",
    customSource: "",
    amount: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(
          "https://uss-car-manager-f0gv.onrender.com/api/cars"
        );
        setCars(res.data);
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e) => {
    setEarning({ ...earning, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalSource =
      earning.source === "Other" ? earning.customSource : earning.source;

    try {
      await axios.post(
        "https://uss-car-manager-f0gv.onrender.com/api/earnings",
        {
          car: earning.car,
          date: earning.date,
          source: finalSource,
          amount: earning.amount,
          notes: earning.notes,
        }
      );
      navigate(`/earnings/${earning.car}`);
    } catch (err) {
      console.error("Error adding earning:", err);
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
          background: "linear-gradient(135deg, #00b09b, #96c93d)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-cash-coin me-2"></i>Add New Earning
          </h2>
          <p className="opacity-75">Record and track your car-related income</p>
          <div
            className="p-3 rounded-3 d-inline-block"
            style={{
              background: "linear-gradient(135deg, #43e97b, #38f9d7)",
              minWidth: "220px",
            }}
          >
            <h6 className="mb-1">Earning Entry</h6>
            <h5 className="fw-bold">
              <i className="bi bi-graph-up-arrow me-2"></i>New Record
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
                background: "linear-gradient(135deg, #00b09b, #96c93d)",
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
                  className="bi bi-cash-coin fs-3"
                  style={{ color: "#00b09b", fontSize: "1.5rem" }}
                ></i>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Car Select */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-car-front-fill me-2 text-success"></i>
                      Select Car
                    </label>
                    <select
                      name="car"
                      className="form-select rounded-pill shadow-sm border-2"
                      value={earning.car}
                      onChange={handleChange}
                      required
                      style={{ borderColor: "#d1fae5", transition: "0.3s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00b09b")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
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
                      <i className="bi bi-calendar-date me-2 text-success"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={earning.date}
                      onChange={handleChange}
                      required
                      style={{ borderColor: "#d1fae5", transition: "0.3s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00b09b")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
                    />
                  </div>

                  {/* Source */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-wallet2 me-2 text-success"></i>
                      Source
                    </label>
                    <select
                      name="source"
                      className="form-select rounded-pill shadow-sm border-2"
                      value={earning.source}
                      onChange={handleChange}
                      required
                      style={{ borderColor: "#d1fae5", transition: "0.3s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00b09b")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
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
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-pencil-square me-2 text-success"></i>
                        Specify Source
                      </label>
                      <input
                        type="text"
                        name="customSource"
                        className="form-control rounded-pill shadow-sm border-2"
                        value={earning.customSource}
                        onChange={handleChange}
                        required
                        style={{
                          borderColor: "#d1fae5",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#00b09b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-rupee me-2 text-success"></i>
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={earning.amount}
                      onChange={handleChange}
                      required
                      style={{ borderColor: "#d1fae5", transition: "0.3s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00b09b")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
                    />
                  </div>

                  {/* Notes */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-stickies me-2 text-success"></i>Notes
                    </label>
                    <input
                      type="text"
                      name="notes"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={earning.notes}
                      onChange={handleChange}
                      style={{ borderColor: "#d1fae5", transition: "0.3s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#00b09b")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1fae5")}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="col-12 mt-3 d-grid gap-2">
                    <button
                      type="submit"
                      className={`btn btn-lg rounded-pill shadow-lg fw-bold ${
                        saving ? "btn-secondary" : "btn-success"
                      }`}
                      style={{
                        background: saving
                          ? undefined
                          : "linear-gradient(135deg, #00b09b, #96c93d)",
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
                          Saving Earning...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>Save
                          Earning
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
          box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25) !important;
        }
        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3) !important;
        }
        .card:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AddEarning;
