import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddPartner = () => {
  const [cars, setCars] = useState([]); // store all cars
  const [partner, setPartner] = useState({
    car: "",
    name: "",
    contactDetails: { phone: "", email: "", address: "" },
    bankDetails: { accountNumber: "", ifsc: "", upiId: "" },
    sharePercentage: "",
    status: "Active",
    image: "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // fetch cars for dropdown
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

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("contactDetails.")) {
      const key = name.split(".")[1];
      setPartner((prev) => ({
        ...prev,
        contactDetails: { ...prev.contactDetails, [key]: value },
      }));
    } else if (name.includes("bankDetails.")) {
      const key = name.split(".")[1];
      setPartner((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [key]: value },
      }));
    } else {
      setPartner({ ...partner, [name]: value });
    }
  };

  // handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // replace with your preset

    try {
      setUploading(true);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dmsybcze6/image/upload`, // replace with your cloud name
        formData
      );
      setPartner({ ...partner, image: res.data.secure_url });
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        "https://uss-car-manager-f0gv.onrender.com/api/partners",
        partner
      );
      navigate("/partners"); // redirect to partners list
    } catch (err) {
      console.error(err);
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
          background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-people-fill me-2"></i>Add New Partner
          </h2>
          <p className="opacity-75">Register a partner for a car</p>
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
                background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
                borderRadius: "18px 18px 0 0",
              }}
            >
              <div
                className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                style={{ width: "70px", height: "70px", marginTop: "15px" }}
              >
                <i
                  className="bi bi-person-plus fs-3"
                  style={{ color: "#ff5e62" }}
                ></i>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Car Select */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-car-front me-2 text-danger"></i>Select
                      Car
                    </label>
                    <select
                      name="car"
                      className="form-select rounded-pill shadow-sm border-2"
                      value={partner.car}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Choose Car --</option>
                      {cars.map((car) => (
                        <option key={car._id} value={car._id}>
                          {car.carName} ({car.carNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person me-2 text-danger"></i>Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-phone me-2 text-danger"></i>Phone
                    </label>
                    <input
                      type="text"
                      name="contactDetails.phone"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.contactDetails.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2 text-danger"></i>Email
                    </label>
                    <input
                      type="email"
                      name="contactDetails.email"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.contactDetails.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Address */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-geo-alt me-2 text-danger"></i>Address
                    </label>
                    <input
                      type="text"
                      name="contactDetails.address"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.contactDetails.address}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Bank Account */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-bank me-2 text-danger"></i>Account No
                    </label>
                    <input
                      type="text"
                      name="bankDetails.accountNumber"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.bankDetails.accountNumber}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UPI ID */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-cash me-2 text-danger"></i>UPI ID
                    </label>
                    <input
                      type="text"
                      name="bankDetails.upiId"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.bankDetails.upiId}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Share Percentage */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-percent me-2 text-danger"></i>Share %
                    </label>
                    <input
                      type="number"
                      name="sharePercentage"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={partner.sharePercentage}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-toggle-on me-2 text-danger"></i>Status
                    </label>
                    <select
                      name="status"
                      className="form-select rounded-pill shadow-sm border-2"
                      value={partner.status}
                      onChange={handleChange}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>

                  {/* Partner Photo (optional) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-camera me-2 text-danger"></i>Partner
                      Photo
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && (
                      <p className="text-primary mt-2">Uploading...</p>
                    )}
                    {partner.image && (
                      <div className="mt-2 text-center">
                        <img
                          src={partner.image}
                          alt="Preview"
                          style={{ maxWidth: "150px", borderRadius: "10px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className={`btn btn-lg rounded-pill shadow-lg fw-bold ${
                      saving ? "btn-secondary" : "btn-danger"
                    }`}
                  >
                    {saving ? "Saving Partner..." : "Save Partner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPartner;
