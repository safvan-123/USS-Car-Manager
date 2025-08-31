// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import axios from "axios";

// const EditExpense = () => {
//   const { id } = useParams(); // expenseId
//   const [cars, setCars] = useState([]);
//   const [partners, setPartners] = useState([]);
//   const [expense, setExpense] = useState({
//     car: "",
//     title: "",
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

//   // Fetch cars
//   useEffect(() => {
//     const fetchCars = async () => {
//       try {
//         const res = await axios.get("http:localhost:5000/api/cars");
//         setCars(res.data);
//       } catch (err) {
//         console.error("Error fetching cars:", err);
//       }
//     };
//     fetchCars();
//   }, []);

//   // Fetch expense details
//   useEffect(() => {
//     const fetchExpense = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`http://localhost:5000/api/expenses/${id}`);
//         const exp = res.data;

//         // Handle old docs that used `amount` instead of `totalAmount`
//         const safeTotal = exp?.totalAmount ?? exp?.amount ?? 0; // number or 0

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
//           title: exp.title || "",
//           type: exp.type || "expense",
//           date: exp.date ? exp.date.substring(0, 10) : "",
//           category: isKnown ? exp.category : "Others",
//           customCategory: isKnown ? "" : exp.category || "",
//           totalAmount: String(safeTotal), // ensure input shows a value
//           notes: exp.notes || "",
//           partners: Array.isArray(exp.partners)
//             ? exp.partners.map((p) => ({
//                 partnerId: p.partnerId?._id || p.partnerId,
//                 name: p.partnerId?.name || "", // may be filled after car partners load
//                 sharePercentage: p.partnerId?.sharePercentage ?? 0,
//                 amount: p.amount ?? 0,
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

//   // Fetch partners when car changes and merge with existing partner amounts
//   useEffect(() => {
//     const fetchPartners = async () => {
//       if (!expense.car) return;
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/partners/car/${expense.car}`
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
//             amount: existing ? existing.amount : 0,
//             paid: existing ? !!existing.paid : false,
//           };
//         });

//         setPartners(partnerState);
//         setExpense((prev) => ({ ...prev, partners: partnerState }));
//       } catch (err) {
//         console.error("Error fetching partners:", err);
//       }
//     };
//     // We want to run this whenever the selected car changes.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     useEffect;
//     fetchPartners();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [expense.car]);

//   const recalcPartnerAmounts = (total) => {
//     return expense.partners.map((p) => {
//       const pct = Number(p.sharePercentage) || 0;
//       const calculated = ((total * pct) / 100).toFixed(2);
//       return { ...p, amount: calculated };
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "totalAmount") {
//       const total = Number(value) || 0;
//       const updatedPartners = recalcPartnerAmounts(total);
//       setExpense((prev) => ({
//         ...prev,
//         totalAmount: value,
//         partners: updatedPartners,
//       }));
//     } else if (name === "category") {
//       setExpense((prev) => ({
//         ...prev,
//         category: value,
//         // clear customCategory when switching away from Others
//         customCategory: value === "Others" ? prev.customCategory : "",
//       }));
//     } else {
//       setExpense((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handlePartnerChange = (index, field, value) => {
//     const updatedPartners = [...expense.partners];
//     if (field === "paid") {
//       updatedPartners[index][field] = value.target.checked;
//     } else {
//       updatedPartners[index][field] = value;
//     }
//     setExpense((prev) => ({ ...prev, partners: updatedPartners }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     const finalCategory =
//       expense.category === "Others" ? expense.customCategory : expense.category;

//     try {
//       await axios.put(`http://localhost:5000/api/expenses/${id}`, {
//         car: expense.car,
//         title: expense.title,
//         type: expense.type,
//         date: expense.date,
//         category: finalCategory,
//         totalAmount: Number(expense.totalAmount) || 0, // ensure number
//         notes: expense.notes,
//         partners: expense.partners.map((p) => ({
//           partnerId: p.partnerId,
//           amount: Number(p.amount) || 0,
//           paid: !!p.paid,
//         })),
//       });
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
//                   <div className="col-md-6">
//                     <label className="form-label fw-semibold">Title</label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="form-control rounded-pill shadow-sm border-2"
//                       value={expense.title}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

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
//                                     handlePartnerChange(index, "paid", e)
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
  const { id } = useParams(); // expenseId
  const [cars, setCars] = useState([]);
  const [partners, setPartners] = useState([]);
  const [expense, setExpense] = useState({
    car: "",
    title: "",
    type: "expense",
    date: "",
    category: "",
    customCategory: "",
    totalAmount: "",
    notes: "",
    partners: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // fetch cars
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

  // fetch expense details
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/expenses/${id}`
        );
        const exp = res.data;

        // Handle old docs that used `amount` instead of `totalAmount`
        const safeTotal = exp?.totalAmount ?? exp?.amount ?? 0;

        const baseCategoryList = [
          "Fuel",
          "Service",
          "Insurance",
          "Tax",
          "Others",
        ];
        const isKnown = baseCategoryList.includes(exp.category);

        setExpense({
          car: exp.car?._id || "",
          title: exp.title || "",
          type: exp.type || "expense",
          date: exp.date ? exp.date.substring(0, 10) : "",
          category: isKnown ? exp.category : "Others",
          customCategory: isKnown ? "" : exp.category || "",
          totalAmount: String(safeTotal),
          notes: exp.notes || "",
          partners: Array.isArray(exp.partners)
            ? exp.partners.map((p) => ({
                partnerId: p.partnerId?._id || p.partnerId,
                name: p.partnerId?.name || "",
                sharePercentage: p.partnerId?.sharePercentage ?? 0,
                amount: Number(p.amount ?? 0),
                paid: !!p.paid,
              }))
            : [],
        });
      } catch (err) {
        console.error("Error fetching expense:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  // 🔹 recalc partner contributions based on total
  const recalcPartnerAmounts = (total, partnersList = expense.partners) => {
    return partnersList.map((p) => {
      const percentage = p.sharePercentage || 0;
      const calculatedAmount = Number(((total * percentage) / 100).toFixed(2));
      return { ...p, amount: calculatedAmount };
    });
  };

  // fetch partners when car changes
  useEffect(() => {
    const fetchPartners = async () => {
      if (!expense.car) return;
      try {
        const res = await axios.get(
          `https://uss-car-manager-f0gv.onrender.com/api/partners/car/${expense.car}`
        );

        const partnerState = res.data.map((p) => {
          const existing = expense.partners.find(
            (ep) =>
              ep.partnerId === p._id ||
              (typeof ep.partnerId === "object" && ep.partnerId?._id === p._id)
          );
          return {
            partnerId: p._id,
            name: p.name,
            sharePercentage: p.sharePercentage ?? 0,
            amount: existing
              ? Number(existing.amount)
              : Number(
                  (
                    (Number(expense.totalAmount || 0) *
                      (p.sharePercentage ?? 0)) /
                    100
                  ).toFixed(2)
                ),
            paid: existing ? !!existing.paid : false,
          };
        });

        setPartners(partnerState);
        setExpense((prev) => ({ ...prev, partners: partnerState }));
      } catch (err) {
        console.error("Error fetching partners:", err);
      }
    };
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense.car]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalAmount") {
      const total = Number(value) || 0;
      const updatedPartners = recalcPartnerAmounts(total);
      setExpense({ ...expense, totalAmount: value, partners: updatedPartners });
    } else if (name === "category") {
      setExpense({
        ...expense,
        category: value,
        customCategory: value === "Others" ? expense.customCategory : "",
      });
    } else {
      setExpense({ ...expense, [name]: value });
    }
  };

  const handlePartnerChange = (index, field, value) => {
    const updatedPartners = [...expense.partners];
    if (field === "paid") {
      updatedPartners[index][field] = value.target.checked;
    } else {
      updatedPartners[index][field] = Number(value);
    }
    setExpense({ ...expense, partners: updatedPartners });
  };

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
          title: expense.title,
          type: expense.type,
          date: expense.date,
          category: finalCategory,
          totalAmount: Number(expense.totalAmount) || 0,
          notes: expense.notes,
          partners: expense.partners.map((p) => ({
            partnerId: p.partnerId,
            amount: Number(p.amount) || 0,
            paid: !!p.paid,
          })),
        }
      );
      navigate(`/expenses/${expense.car}`);
    } catch (err) {
      console.error("Error updating expense:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Loading expense details...</p>
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
          <h2 className="fw-bold mb-2">✏️ Edit Expense</h2>
          <p className="opacity-75">
            Update and manage your car-related expense
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10 col-12">
          <div
            className="card border-0 shadow-lg"
            style={{ borderRadius: "18px" }}
          >
            <div
              className="card-header border-0 text-center"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "18px 18px 0 0",
              }}
            >
              <h5 className="text-white my-2">Expense Details</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Car */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Car</label>
                    <select
                      name="car"
                      className="form-select rounded-pill shadow-sm border-2"
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

                  {/* Title */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control rounded-pill shadow-sm border-2"
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
                      className="form-select rounded-pill shadow-sm border-2"
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

                  {expense.category === "Others" && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Specify Category
                      </label>
                      <input
                        type="text"
                        name="customCategory"
                        className="form-control rounded-pill shadow-sm border-2"
                        value={expense.customCategory}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  {/* Total */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      name="totalAmount"
                      className="form-control rounded-pill shadow-sm border-2"
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
                      className="form-control rounded-pill shadow-sm border-2"
                      value={expense.notes}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Partners */}
                  <div className="col-12">
                    <h5 className="fw-bold text-primary mt-3 mb-2">
                      Partner Contributions
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Partner</th>
                            <th>Share %</th>
                            <th>Amount</th>
                            <th>Paid?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expense.partners.map((p, index) => (
                            <tr key={p.partnerId}>
                              <td>{p.name}</td>
                              <td>{p.sharePercentage}%</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control rounded-pill"
                                  value={p.amount}
                                  onChange={(e) =>
                                    handlePartnerChange(
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={!!p.paid}
                                  onChange={(e) =>
                                    handlePartnerChange(index, "paid", e)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

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
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "💾 Update Expense"
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
    </div>
  );
};

export default EditExpense;
