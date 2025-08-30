import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axios.get(
          "https://uss-car-manager-f0gv.onrender.com/api/partners"
        );
        setPartners(res.data);
      } catch (err) {
        console.error("Error fetching partners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  // Delete partner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?"))
      return;
    try {
      await axios.delete(
        `https://uss-car-manager-f0gv.onrender.com/api/partners/${id}`
      );
      setPartners((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading)
    return <p className="text-center mt-10 fw-semibold">Loading partners...</p>;

  return (
    <div className="container my-4">
      {/* Header */}
      <div
        className="card shadow-lg border-0 text-center text-white mb-4"
        style={{
          background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-people-fill me-2"></i>Partner List
          </h2>
          <p className="opacity-75">Manage all partners across cars</p>
        </div>
      </div>

      {/* Add Partner Button */}
      <div className="d-flex justify-content-end mb-3">
        <Link
          to="/add-partner"
          className="btn btn-danger fw-bold shadow rounded-pill px-4"
        >
          <i className="bi bi-plus-circle me-2"></i>Add Partner
        </Link>
      </div>

      {/* Partner Cards (Responsive) */}
      <div className="row g-4">
        {partners.map((partner) => (
          <div key={partner._id} className="col-xl-4 col-lg-6 col-md-6 col-12">
            <div
              className="card shadow-lg h-100 border-0"
              style={{ borderRadius: "18px" }}
            >
              {/* Partner Header */}
              <div
                className="card-header text-white text-center"
                style={{
                  background:
                    partner.status === "Active"
                      ? "linear-gradient(135deg, #28a745 0%, #218838 100%)"
                      : "linear-gradient(135deg, #dc3545 0%, #a71d2a 100%)",
                  borderRadius: "18px 18px 0 0",
                }}
              >
                <h5 className="fw-bold mb-0">{partner.name}</h5>
                <small className="opacity-75">
                  {partner.car?.carName} ({partner.car?.carNumber})
                </small>
              </div>

              {/* Partner Body */}
              <div className="card-body p-3">
                <p className="mb-2">
                  <i className="bi bi-phone text-danger me-2"></i>
                  {partner.contactDetails?.phone || "-"}
                </p>
                <p className="mb-2">
                  <i className="bi bi-envelope text-danger me-2"></i>
                  {partner.contactDetails?.email || "-"}
                </p>
                <p className="mb-2">
                  <i className="bi bi-geo-alt text-danger me-2"></i>
                  {partner.contactDetails?.address || "-"}
                </p>
                <p className="mb-2">
                  <i className="bi bi-percent text-danger me-2"></i>
                  {partner.sharePercentage}%
                </p>
              </div>

              {/* Actions */}
              <div className="card-footer bg-white text-center border-0">
                <Link
                  to={`/edit-partner/${partner._id}`}
                  className="btn btn-warning btn-sm rounded-pill me-2 fw-semibold"
                >
                  <i className="bi bi-pencil-square me-1"></i>Edit
                </Link>
                <button
                  onClick={() => handleDelete(partner._id)}
                  className="btn btn-danger btn-sm rounded-pill fw-semibold"
                >
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {partners.length === 0 && (
          <p className="text-center text-muted fw-semibold mt-4">
            No partners found.
          </p>
        )}
      </div>
    </div>
  );
}
