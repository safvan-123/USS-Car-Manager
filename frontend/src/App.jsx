import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CarList from "./components/car_module/CarList";
import AddCar from "./components/car_module/AddCar";
import EditCar from "./components/car_module/EditCar";
import ExpenseList from "./components/expenses/ExpenseList";
import AddExpense from "./components/expenses/AddExpense";
import EditExpense from "./components/expenses/EditExpense";
import AddEarning from "./components/earnings/AddEarning";
import EarningList from "./components/earnings/EarningList";
import EditEarning from "./components/earnings/EditEarning";
import CarDetail from "./components/car_module/CarDetail";
import CarSummary from "./components/car_module/CarSummary";
import AddPartner from "./components/partners/AddPartner";
import PartnerList from "./components/partners/PartnerList";
import EditPartner from "./components/partners/EditPartner";

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
            <div className="navbar-nav gap-2 mt-2 mt-lg-0 d-flex flex-column flex-lg-row align-items-stretch">
              {/* 🚗 Cars Dropdown */}
              <div className="dropdown w-100 w-lg-auto">
                <button
                  className="btn btn-light shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3 dropdown-toggle w-100"
                  id="carsDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="me-2">🚗</span> Cars
                </button>
                <ul
                  className="dropdown-menu border-0 shadow-lg rounded-4 p-2 animate__animated animate__fadeIn"
                  aria-labelledby="carsDropdown"
                  style={{ minWidth: "220px" }}
                >
                  <li>
                    <Link
                      to="/"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      📋 View Cars
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/add"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      ➕ Add Car
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 💰 Finance Dropdown */}
              <div className="dropdown w-100 w-lg-auto">
                <button
                  className="btn btn-light shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3 dropdown-toggle w-100"
                  id="financeDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="me-2">💰</span> Finance
                </button>
                <ul
                  className="dropdown-menu border-0 shadow-lg rounded-4 p-2 animate__animated animate__fadeIn"
                  aria-labelledby="financeDropdown"
                  style={{ minWidth: "220px" }}
                >
                  <li>
                    <Link
                      to="/add-earning"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      📈 Earnings Entry
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/add-expense"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      💸 Expenses Entry
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 👥 Partners Dropdown */}
              <div className="dropdown w-100 w-lg-auto">
                <button
                  className="btn btn-light shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3 dropdown-toggle w-100"
                  id="partnersDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="me-2">👥</span> Partners
                </button>
                <ul
                  className="dropdown-menu border-0 shadow-lg rounded-4 p-2 animate__animated animate__fadeIn"
                  aria-labelledby="partnersDropdown"
                  style={{ minWidth: "220px" }}
                >
                  <li>
                    <Link
                      to="/partners"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      📋 View Partners
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/add-partner"
                      className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2"
                    >
                      ➕ Add Partner
                    </Link>
                  </li>
                </ul>
              </div>
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
          <Route path="/add-earning" element={<AddEarning />} />
          <Route path="/earnings/:carId" element={<EarningList />} />
          <Route path="/edit-earning/:id" element={<EditEarning />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/summary/:carId" element={<CarSummary />} />
          <Route path="/add-partner" element={<AddPartner />} />
          <Route path="/partners" element={<PartnerList />} />
          <Route path="/edit-partner/:id" element={<EditPartner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
