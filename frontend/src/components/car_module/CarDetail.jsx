import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCar();
  }, []);

  const fetchCar = async () => {
    try {
      const res = await axios.get(
        `https://uss-car-manager-f0gv.onrender.com/api/cars/${id}`
      );
      setCar(res.data);
    } catch (err) {
      console.error("Error fetching car details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading Car Details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container text-center my-5">
        <i className="bi bi-exclamation-circle text-danger display-4"></i>
        <h4 className="mt-3">Car Not Found</h4>
        <Link to="/" className="btn btn-outline-primary rounded-pill mt-3">
          ⬅ Back to Dashboard
        </Link>
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
          <h2 className="fw-bold mb-2 text-truncate">
            <i className="bi bi-car-front-fill me-2"></i>
            {car.carName} <small>({car.carNumber})</small>
          </h2>
          <p className="opacity-75">Detailed information about your vehicle</p>
        </div>
      </div>

      {/* Car Info Card */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">
          <div
            className="card border-0 shadow-lg"
            style={{ borderRadius: "18px", overflow: "hidden" }}
          >
            {/* Car Image */}
            {car.image ? (
              <img
                src={car.image}
                alt={car.carName}
                className="car-image w-100"
                style={{
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center w-100 car-image"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  fontSize: "3rem",
                }}
              >
                <i className="bi bi-car-front-fill"></i>
              </div>
            )}

            {/* Car Details */}
            <div className="card-body p-4">
              <div className="row g-3 text-start">
                <div className="col-12 col-sm-6">
                  <p className="mb-2">
                    <i className="bi bi-car-front-fill me-2 text-primary"></i>
                    <b>Car Number:</b> {car.carNumber}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-speedometer2 me-2 text-primary"></i>
                    <b>Model:</b> {car.model}
                  </p>
                </div>
                <div className="col-12 col-sm-6">
                  <p className="mb-2">
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    <b>Owner:</b> {car.owner}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    <b>Year:</b> {car.model || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="card-footer bg-white border-0 p-3">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link
                  to={`/expenses/${car._id}`}
                  className="btn btn-outline-success rounded-pill flex-fill"
                >
                  💰 View Expenses
                </Link>
                {/* <Link
                  to={`/add-expense?carId=${car._id}`}
                  className="btn btn-outline-primary rounded-pill flex-fill"
                >
                  ➕ Add Expense
                </Link> */}
                <Link
                  to={`/earnings/${car._id}`}
                  className="btn btn-outline-success rounded-pill flex-fill"
                >
                  💵 View Earnings
                </Link>
                <Link
                  to={`/edit/${car._id}`}
                  className="btn btn-outline-warning rounded-pill flex-fill"
                >
                  ✏️ Edit Car
                </Link>
                <Link
                  to={`/summary/${car._id}`}
                  className="btn btn-outline-info rounded-pill flex-fill"
                >
                  📊 View Summary
                </Link>
                <Link
                  to="/"
                  className="btn btn-outline-secondary rounded-pill flex-fill"
                >
                  ⬅ Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
  .car-image {
    height: 200px; /* Default for mobile */
  }

  @media (min-width: 576px) {
    .car-image {
      height: 260px;
    }
  }

  @media (min-width: 768px) {
    .car-image {
      height: 270px;
    }
  }

  @media (min-width: 992px) {
    .car-image {
      height: 320px;
    }
  }
        .card {
          transition: transform 0.3s ease;
        }
        @media (min-width: 768px) {
          .card:hover {
            transform: translateY(-6px);
          }
        }
        h2, h5 {
          word-break: break-word;
        }
        @media (max-width: 576px) {
          h2 {
            font-size: 1.3rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 8px 12px;
          }
        }
`}
      </style>

      {/* Styles */}
    </div>
  );
};

export default CarDetail;
