// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import CarList from "./components/car_module/CarList";
// import AddCar from "./components/car_module/AddCar";
// import EditCar from "./components/car_module/EditCar";
// import ExpenseList from "./components/expenses/ExpenseList";
// import AddExpense from "./components/expenses/AddExpense";
// import EditExpense from "./components/expenses/EditExpense";

// function App() {
//   return (
//     <Router>
//       {/* Compact Header */}
//       <div
//         className="container-fluid py-3 mb-4"
//         style={{
//           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

//           boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
//         }}
//       >
//         <div className="d-flex flex-wrap align-items-center justify-content-between px-3">
//           {/* Logo / Title */}
//           <Link
//             to="/"
//             className="d-flex align-items-center text-white text-decoration-none fw-bold"
//             style={{ fontSize: "1.25rem" }}
//           >
//             <i className="bi bi-car-front-fill me-2"></i>Car Manager
//           </Link>

//           {/* Action Buttons */}
//           <div className="d-flex flex-wrap gap-2">
//             <Link to="/" className="btn btn-light shadow-sm px-3 rounded-pill">
//               🚗 View Cars
//             </Link>
//             <Link
//               to="/add"
//               className="btn btn-light shadow-sm px-3 rounded-pill"
//             >
//               + Add Car
//             </Link>
//             <Link
//               to="/add-expense"
//               className="btn btn-light shadow-sm px-3 rounded-pill"
//             >
//               💰 Add Expense
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Routes */}
//       <div className="container mt-4">
//         <Routes>
//           <Route path="/" element={<CarList />} />
//           <Route path="/add" element={<AddCar />} />
//           <Route path="/edit/:id" element={<EditCar />} />
//           <Route path="/expenses/:carId" element={<ExpenseList />} />
//           <Route path="/add-expense" element={<AddExpense />} />
//           <Route path="/edit-expense/:id" element={<EditExpense />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CarList from "./components/car_module/CarList";
import AddCar from "./components/car_module/AddCar";
import EditCar from "./components/car_module/EditCar";
import ExpenseList from "./components/expenses/ExpenseList";
import AddExpense from "./components/expenses/AddExpense";
import EditExpense from "./components/expenses/EditExpense";

function App() {
  return (
    <Router>
      {/* Responsive Header with Hamburger Menu */}
      <nav
        className="navbar navbar-expand-lg py-3"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <div className="container">
          {/* Logo / Title */}
          <Link
            to="/"
            className="navbar-brand text-white fw-bold d-flex align-items-center"
          >
            <i className="bi bi-car-front-fill me-2"></i>USS Car Manager
          </Link>

          {/* Hamburger Toggler for Mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
            aria-controls="navbarMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span
              className="navbar-toggler-icon"
              style={{ filter: "invert(1)" }}
            ></span>
          </button>

          {/* Menu Items */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarMenu"
          >
            <div className="navbar-nav gap-2 mt-2 mt-lg-0">
              <Link
                to="/"
                className="btn btn-light shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3"
              >
                <span className="me-2" style={{ marginTop: "-8px" }}>
                  🚗
                </span>
                View Cars
              </Link>

              <Link
                to="/add"
                className="btn btn-light shadow-sm px-3 rounded-pill"
              >
                + Add Car
              </Link>
              <Link
                to="/add-expense"
                className="btn btn-light shadow-sm px-3 rounded-pill"
              >
                💰 Add Expense
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<CarList />} />
          <Route path="/add" element={<AddCar />} />
          <Route path="/edit/:id" element={<EditCar />} />
          <Route path="/expenses/:carId" element={<ExpenseList />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/edit-expense/:id" element={<EditExpense />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
