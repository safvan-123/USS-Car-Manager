// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

// const CarList = () => {
//   const [cars, setCars] = useState([]);

//   useEffect(() => {
//     fetchCars();
//   }, []);

//   const fetchCars = async () => {
//     try {
//       const res = await axios.get(
//         "https://uss-car-manager-f0gv.onrender.com/api/cars"
//       );
//       setCars(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const deleteCar = async (id) => {
//     if (window.confirm("Are you sure you want to delete this car?")) {
//       try {
//         await axios.delete(
//           `https://uss-car-manager-f0gv.onrender.com/api/cars/${id}`
//         );
//         fetchCars();
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   };

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
//           <h2 className="fw-bold mb-2">
//             <i className="bi bi-car-front-fill me-2"></i>Cars Garriage
//           </h2>
//           <p className="opacity-75">
//             Manage your vehicles and track all related expenses
//           </p>
//           <div className="mt-3">
//             <Link
//               to="/add"
//               className="btn btn-light shadow-sm px-4 rounded-pill"
//             >
//               <i className="bi bi-plus-lg me-2"></i>Add New Car
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Car Cards */}
//       <div className="row g-4">
//         {cars.length > 0 ? (
//           cars.map((car, index) => (
//             <div key={car._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
//               <div
//                 className="card shadow-lg border-0 car-card"
//                 style={{
//                   borderRadius: "18px",
//                   animation: `fadeUp 0.4s ease-out ${index * 0.1}s both`,
//                   overflow: "hidden",
//                 }}
//               >
//                 {car.image ? (
//                   <div
//                     className="car-image-wrapper"
//                     style={{
//                       width: "100%",
//                       height: "200px",
//                       overflow: "hidden",
//                     }}
//                   >
//                     <img
//                       src={car.image}
//                       alt={car.carName}
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                         display: "block",
//                       }}
//                     />
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       width: "100%",
//                       height: "200px",
//                       background:
//                         "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: "#fff",
//                       fontSize: "2rem",
//                     }}
//                   >
//                     <i className="bi bi-car-front-fill"></i>
//                   </div>
//                 )}

//                 <div className="card-body text-center">
//                   <h5 className="fw-bold text-primary">{car.carName}</h5>
//                   <p className="mb-1">
//                     <b>Number:</b> {car.carNumber}
//                   </p>
//                   <p className="mb-1">
//                     <b>Model:</b> {car.model}
//                   </p>
//                   <p className="mb-2">
//                     <b>Owner:</b> {car.owner}
//                   </p>
//                 </div>

//                 <div className="card-footer d-flex gap-2 bg-white border-0 flex-wrap justify-content-center">
//                   {/* <Link
//                     to={`/expenses/${car._id}`}
//                     className="btn btn-outline-success flex-fill rounded-pill"
//                   >
//                     💰 View Expenses
//                   </Link> */}
//                   <Link
//                     to={`/car/${car._id}`}
//                     className="btn btn-outline-info flex-fill rounded-pill"
//                   >
//                     📋 Details
//                   </Link>
//                   <Link
//                     to={`/edit/${car._id}`}
//                     className="btn btn-outline-primary flex-fill rounded-pill"
//                   >
//                     ✏️ Edit
//                   </Link>
//                   <button
//                     onClick={() => deleteCar(car._id)}
//                     className="btn btn-outline-danger flex-fill rounded-pill"
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center mt-5 col-12">
//             <i className="bi bi-exclamation-circle display-4 text-primary"></i>
//             <h4 className="text-muted mt-3">No Cars Found</h4>
//             <p className="text-secondary">
//               Please add a vehicle to get started 🚘
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Styles */}
//       <style>{`
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .car-card {
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//         }
//         .car-card:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 12px 25px rgba(0,0,0,0.15);
//         }
//         @media (max-width: 576px) {
//           .card-body h5 {
//             font-size: 1rem;
//           }
//           .card-footer .btn {
//             font-size: 0.8rem;
//             padding: 6px 10px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CarList;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [carToDelete, setCarToDelete] = useState(null); // store selected car for delete
  const [selectedCarname, setselectedCarname] = useState("");
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get(
        "https://uss-car-manager-f0gv.onrender.com/api/cars"
      );
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id, name) => {
    setCarToDelete(id);
    setselectedCarname(name);
    // open confirmation popup
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://uss-car-manager-f0gv.onrender.com/api/cars/${carToDelete}`
      );
      setCarToDelete(null);
      fetchCars();
    } catch (err) {
      console.error(err);
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
            <i className="bi bi-car-front-fill me-2"></i>Cars Garriage
          </h2>
          <p className="opacity-75">
            Manage your vehicles and track all related expenses
          </p>
          <div className="mt-3">
            <Link
              to="/add"
              className="btn btn-light shadow-sm px-4 rounded-pill"
            >
              <i className="bi bi-plus-lg me-2"></i>Add New Car
            </Link>
          </div>
        </div>
      </div>

      {/* Car Cards */}
      <div className="row g-4">
        {cars.length > 0 ? (
          cars.map((car, index) => (
            <div key={car._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
              <div
                className="card shadow-lg border-0 car-card"
                style={{
                  borderRadius: "18px",
                  animation: `fadeUp 0.4s ease-out ${index * 0.1}s both`,
                  overflow: "hidden",
                }}
              >
                {car.image ? (
                  <div
                    className="car-image-wrapper"
                    style={{
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={car.image}
                      alt={car.carName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "2rem",
                    }}
                  >
                    <i className="bi bi-car-front-fill"></i>
                  </div>
                )}
                <div className="card-body text-center">
                  <h5 className="fw-bold text-primary">{car.carName}</h5>
                  <p className="mb-1">
                    <b>Number:</b> {car.carNumber}
                  </p>
                  <p className="mb-1">
                    <b>Model:</b> {car.model}
                  </p>
                  <p className="mb-2">
                    <b>Owner:</b> {car.owner}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="card-footer d-flex bg-white border-0 justify-content-between gap-2 flex-nowrap">
                  <Link
                    to={`/car/${car._id}`}
                    className="btn btn-outline-info flex-fill rounded-pill"
                  >
                    📋 Details
                  </Link>
                  <Link
                    to={`/edit/${car._id}`}
                    className="btn btn-outline-primary flex-fill rounded-pill"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => confirmDelete(car._id, car.carName)}
                    className="btn btn-outline-danger flex-fill rounded-pill"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-5 col-12">
            <i className="bi bi-exclamation-circle display-4 text-primary"></i>
            <h4 className="text-muted mt-3">No Cars Found</h4>
            <p className="text-secondary">
              Please add a vehicle to get started 🚘
            </p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {carToDelete && (
        <div className="custom-modal">
          <div className="modal-content text-center p-4 rounded-4 shadow">
            <h5 className="fw-bold mb-3">Delete {selectedCarname}?</h5>
            <p className="text-muted mb-4">
              Are you sure you want to delete {selectedCarname} from your car
              lists?
            </p>
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <button
                className="btn btn-secondary rounded-pill px-4"
                onClick={() => setCarToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger rounded-pill px-4"
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .car-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .car-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .custom-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .modal-content {
          background: #fff;
          max-width: 400px;
          width: 90%;
        }
        @media (max-width: 576px) {
          .card-body h5 {
            font-size: 1rem;
          }
          .card-footer .btn {
            font-size: 0.8rem;
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CarList;
