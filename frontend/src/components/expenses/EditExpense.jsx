// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import axios from "axios";

// const EditExpense = () => {
//   const { id } = useParams(); // expenseId
//   const [cars, setCars] = useState([]);
//   const [partners, setPartners] = useState([]);
//   const [expense, setExpense] = useState({
//     car: "",
//     // title: "",
//     type: "expense",
//     date: "",
//     category: "",
//     customCategory: "",
//     totalAmount: "",
//     notes: "",
//     partners: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const navigate = useNavigate();

//   // fetch cars
//   useEffect(() => {
//     const fetchCars = async () => {
//       try {
//         const res = await axios.get(
//           "https://uss-car-manager-f0gv.onrender.com/api/cars"
//         );
//         setCars(res.data);
//       } catch (err) {
//         console.error("Error fetching cars:", err);
//       }
//     };
//     fetchCars();
//   }, []);

//   // fetch expense details
//   useEffect(() => {
//     const fetchExpense = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`
//         );
//         const exp = res.data;

//         // Handle old docs that used `amount` instead of `totalAmount`
//         const safeTotal = exp?.totalAmount ?? exp?.amount ?? 0;

//         const baseCategoryList = [
//           "Fuel",
//           "Service",
//           "Insurance",
//           "Tax",
//           "Others",
//         ];
//         const isKnown = baseCategoryList.includes(exp.category);

//         setExpense({
//           car: exp.car?._id || "",
//           // title: exp.title || "",
//           type: exp.type || "expense",
//           date: exp.date ? exp.date.substring(0, 10) : "",
//           category: isKnown ? exp.category : "Others",
//           customCategory: isKnown ? "" : exp.category || "",
//           totalAmount: String(safeTotal),
//           notes: exp.notes || "",
//           partners: Array.isArray(exp.partners)
//             ? exp.partners.map((p) => ({
//                 partnerId: p.partnerId?._id || p.partnerId,
//                 name: p.partnerId?.name || "",
//                 sharePercentage: p.partnerId?.sharePercentage ?? 0,
//                 amount: Number(p.amount ?? 0),
//                 paid: !!p.paid,
//               }))
//             : [],
//         });
//       } catch (err) {
//         console.error("Error fetching expense:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExpense();
//   }, [id]);

//   // 🔹 recalc partner contributions based on total
//   const recalcPartnerAmounts = (total, partnersList = expense.partners) => {
//     return partnersList.map((p) => {
//       const percentage = p.sharePercentage || 0;
//       const calculatedAmount = Number(((total * percentage) / 100).toFixed(2));
//       return { ...p, amount: calculatedAmount };
//     });
//   };

//   // fetch partners when car changes
//   useEffect(() => {
//     const fetchPartners = async () => {
//       if (!expense.car) return;
//       try {
//         const res = await axios.get(
//           `https://uss-car-manager-f0gv.onrender.com/api/partners/car/${expense.car}`
//         );

//         const partnerState = res.data.map((p) => {
//           const existing = expense.partners.find(
//             (ep) =>
//               ep.partnerId === p._id ||
//               (typeof ep.partnerId === "object" && ep.partnerId?._id === p._id)
//           );
//           return {
//             partnerId: p._id,
//             name: p.name,
//             sharePercentage: p.sharePercentage ?? 0,
//             amount: existing
//               ? Number(existing.amount)
//               : Number(
//                   (
//                     (Number(expense.totalAmount || 0) *
//                       (p.sharePercentage ?? 0)) /
//                     100
//                   ).toFixed(2)
//                 ),
//             paid: existing ? !!existing.paid : false,
//           };
//         });

//         setPartners(partnerState);
//         setExpense((prev) => ({ ...prev, partners: partnerState }));
//       } catch (err) {
//         console.error("Error fetching partners:", err);
//       }
//     };
//     fetchPartners();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [expense.car]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "totalAmount") {
//       const total = Number(value) || 0;
//       const updatedPartners = recalcPartnerAmounts(total);
//       setExpense({ ...expense, totalAmount: value, partners: updatedPartners });
//     } else if (name === "category") {
//       setExpense({
//         ...expense,
//         category: value,
//         customCategory: value === "Others" ? expense.customCategory : "",
//       });
//     } else {
//       setExpense({ ...expense, [name]: value });
//     }
//   };

//   // ✅ FIXED: handle partner paid + amount update correctly
//   const handlePartnerChange = (index, field, value) => {
//     const updatedPartners = [...expense.partners];
//     if (field === "paid") {
//       updatedPartners[index][field] = value; // value is true/false
//     } else {
//       updatedPartners[index][field] = Number(value);
//     }
//     setExpense({ ...expense, partners: updatedPartners });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     const finalCategory =
//       expense.category === "Others" ? expense.customCategory : expense.category;

//     try {
//       await axios.put(
//         `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`,
//         {
//           car: expense.car,
//           // title: expense.title,
//           type: expense.type,
//           date: expense.date,
//           category: finalCategory,
//           totalAmount: Number(expense.totalAmount) || 0,
//           notes: expense.notes,
//           partners: expense.partners.map((p) => ({
//             partnerId: p.partnerId,
//             amount: Number(p.amount) || 0,
//             paid: !!p.paid,
//           })),
//         }
//       );
//       navigate(`/expenses/${expense.car}`);
//     } catch (err) {
//       console.error("Error updating expense:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container mt-5 text-center">
//         <div className="spinner-border text-primary" role="status" />
//         <p className="mt-3 text-muted">Loading expense details...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-4">
//       {/* Header */}
//       <div
//         className="card shadow-lg border-0 text-center text-white mb-4"
//         style={{
//           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//           borderRadius: "20px",
//         }}
//       >
//         <div className="card-body p-4">
//           <h2 className="fw-bold mb-2">✏️ Edit Expense</h2>
//           <p className="opacity-75">
//             Update and manage your car-related expense
//           </p>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="row justify-content-center">
//         <div className="col-xl-8 col-lg-10 col-12">
//           <div
//             className="card border-0 shadow-lg"
//             style={{ borderRadius: "18px" }}
//           >
//             <div
//               className="card-header border-0 text-center"
//               style={{
//                 background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                 borderRadius: "18px 18px 0 0",
//               }}
//             >
//               <h5 className="text-white my-2">Expense Details</h5>
//             </div>

//             <div className="card-body p-4">
//               <form onSubmit={handleSubmit}>
//                 <div className="row g-4">
//                   {/* Car */}
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Car</label>
//                     <select
//                       name="car"
//                       className="form-select rounded-pill shadow-sm border-2"
//                       value={expense.car}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="">-- Select Car --</option>
//                       {cars.map((c) => (
//                         <option key={c._id} value={c._id}>
//                           {c.carName} ({c.carNumber})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Title */}
//                   {/* <div className="col-md-6">
//                     <label className="form-label fw-semibold">Title</label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="form-control rounded-pill shadow-sm border-2"
//                       value={expense.title}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div> */}

//                   {/* Date */}
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Date</label>
//                     <input
//                       type="date"
//                       name="date"
//                       className="form-control rounded-pill shadow-sm border-2"
//                       value={expense.date}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   {/* Category */}
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Category</label>
//                     <select
//                       name="category"
//                       className="form-select rounded-pill shadow-sm border-2"
//                       value={expense.category}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="">-- Select Category --</option>
//                       <option value="Fuel">Fuel</option>
//                       <option value="Service">Service</option>
//                       <option value="Insurance">Insurance</option>
//                       <option value="Tax">Tax</option>
//                       <option value="Others">Others</option>
//                     </select>
//                   </div>

//                   {expense.category === "Others" && (
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">
//                         Specify Category
//                       </label>
//                       <input
//                         type="text"
//                         name="customCategory"
//                         className="form-control rounded-pill shadow-sm border-2"
//                         value={expense.customCategory}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
//                   )}

//                   {/* Total */}
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">
//                       Total Amount
//                     </label>
//                     <input
//                       type="number"
//                       name="totalAmount"
//                       className="form-control rounded-pill shadow-sm border-2"
//                       value={expense.totalAmount}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   {/* Notes */}
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Notes</label>
//                     <input
//                       type="text"
//                       name="notes"
//                       className="form-control rounded-pill shadow-sm border-2"
//                       value={expense.notes}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   {/* Partners */}
//                   <div className="col-12">
//                     <h5 className="fw-bold text-primary mt-3 mb-2">
//                       Partner Contributions
//                     </h5>
//                     <div className="table-responsive">
//                       <table className="table table-bordered text-center align-middle">
//                         <thead className="table-light">
//                           <tr>
//                             <th>Partner</th>
//                             <th>Share %</th>
//                             <th>Amount</th>
//                             <th>Paid?</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {expense.partners.map((p, index) => (
//                             <tr key={p.partnerId}>
//                               <td>{p.name}</td>
//                               <td>{p.sharePercentage}%</td>
//                               <td>
//                                 <input
//                                   type="number"
//                                   className="form-control rounded-pill"
//                                   value={p.amount}
//                                   onChange={(e) =>
//                                     handlePartnerChange(
//                                       index,
//                                       "amount",
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="checkbox"
//                                   className="form-check-input"
//                                   checked={!!p.paid}
//                                   onChange={(e) =>
//                                     handlePartnerChange(
//                                       index,
//                                       "paid",
//                                       e.target.checked
//                                     )
//                                   }
//                                 />
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {/* Buttons */}
//                   <div className="col-12 mt-3 d-grid gap-2">
//                     <button
//                       type="submit"
//                       className={`btn btn-lg rounded-pill shadow-lg fw-bold ${
//                         saving ? "btn-secondary" : "btn-primary"
//                       }`}
//                       style={{
//                         background: saving
//                           ? undefined
//                           : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                         border: "none",
//                         padding: "12px 0",
//                       }}
//                       disabled={saving}
//                     >
//                       {saving ? (
//                         <>
//                           <span
//                             className="spinner-border spinner-border-sm me-2"
//                             role="status"
//                           ></span>
//                           Saving...
//                         </>
//                       ) : (
//                         "💾 Update Expense"
//                       )}
//                     </button>
//                     <Link
//                       to="/"
//                       className="btn btn-outline-secondary py-2 rounded-pill"
//                     >
//                       ⬅ Back to Dashboard
//                     </Link>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditExpense;

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const EditExpense = () => {
  const { id, carId } = useParams();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [expense, setExpense] = useState({
    car: carId || "",
    date: "",
    category: "",
    customCategory: "",
    totalAmount: "",
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

  // 🔹 Fetch existing expense
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`
        );

        setExpense({
          car: data.car?._id || carId,
          date: data.date ? data.date.split("T")[0] : "",
          category: ["Fuel", "Service", "Insurance", "Tax"].includes(
            data.category
          )
            ? data.category
            : "Others",
          customCategory: ["Fuel", "Service", "Insurance", "Tax"].includes(
            data.category
          )
            ? ""
            : data.category,
          totalAmount: data.totalAmount ?? data.amount ?? "",
          notes: data.notes || "",
        });

        if (data.partners && data.partners.length > 0) {
          setPartnerInputs(
            data.partners.map((p) => ({
              partnerId: p.partnerId?._id || p.partnerId,
              name: p.partnerId?.name || "Partner",
              share: p.partnerId?.sharePercentage || 0,
              amount: Math.round(p.amount),
              paid: p.paid,
            }))
          );
        } else {
          fetchPartners(data.car?._id || carId, data.totalAmount);
        }
      } catch (err) {
        console.error("Error fetching expense:", err);
        alert("Failed to load expense details");
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
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
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  // 🔹 Update partner amounts whenever totalAmount changes
  useEffect(() => {
    const total = parseFloat(expense.totalAmount) || 0;
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
  }, [expense.totalAmount, partnerInputs.length]);

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

    const finalCategory =
      expense.category === "Others" ? expense.customCategory : expense.category;

    try {
      await axios.put(
        `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`,
        {
          car: expense.car,
          date: expense.date,
          category: finalCategory,
          totalAmount: parseFloat(expense.totalAmount),
          notes: expense.notes,
          partners: partnerInputs.map((p) => ({
            partnerId: p.partnerId,
            amount: p.amount,
            paid: p.paid,
          })),
        }
      );
      navigate(`/expenses/${expense.car}`);
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading expense details...</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Header */}
      <div
        className="card shadow-lg border-0 text-center text-white mb-4"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-pencil-square me-2"></i>Edit Expense
          </h2>
          <p className="opacity-75">Update your car’s expense record</p>
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
              value={expense.car}
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
              value={expense.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category</label>
            <select
              name="category"
              className="form-select rounded-pill"
              value={expense.category}
              onChange={handleChange}
              required
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
            <div className="col-md-6">
              <label className="form-label fw-semibold">Custom Category</label>
              <input
                type="text"
                name="customCategory"
                className="form-control rounded-pill"
                value={expense.customCategory}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Total Amount */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Total Amount (₹)</label>
            <input
              type="number"
              name="totalAmount"
              className="form-control rounded-pill"
              value={expense.totalAmount}
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
              value={expense.notes}
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
            className="btn btn-primary rounded-pill px-4"
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
                Update Expense
              </>
            )}
          </button>
          <Link
            to={`/expenses/${expense.car}`}
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

export default EditExpense;
