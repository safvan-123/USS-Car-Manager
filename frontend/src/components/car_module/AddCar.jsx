import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCar = () => {
  const [car, setCar] = useState({
    carName: "",
    carNumber: "",
    model: "",
    owner: "",
    image: "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Handle text inputs
  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // Replace with your Cloudinary preset

    try {
      setUploading(true);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dmsybcze6/image/upload`, // Replace with your Cloudinary cloud name
        formData
      );
      setCar({ ...car, image: res.data.secure_url });
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/cars", car);
      navigate("/");
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">
            <i className="bi bi-car-front-fill me-2"></i>Add New Car
          </h2>
          <p className="opacity-75">Register a new vehicle to your fleet</p>
          <div
            className="p-3 rounded-3 d-inline-block"
            style={{
              background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
              minWidth: "220px",
            }}
          >
            <h6 className="mb-1">Car Registration</h6>
            <h5 className="fw-bold">
              <i className="bi bi-plus-circle me-2"></i>New Entry
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
              <div
                className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow"
                style={{ width: "70px", height: "70px", marginTop: "15px" }}
              >
                <i
                  className="bi bi-car-front fs-3"
                  style={{ color: "#667eea" }}
                ></i>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Car Name */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tag me-2 text-primary"></i>Car Name
                    </label>
                    <input
                      type="text"
                      name="carName"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={car.carName}
                      onChange={handleChange}
                      placeholder="e.g., Toyota Camry"
                      required
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                    />
                  </div>

                  {/* Car Number */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-123 me-2 text-primary"></i>Car Number
                    </label>
                    <input
                      type="text"
                      name="carNumber"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={car.carNumber}
                      onChange={handleChange}
                      placeholder="e.g., MH01AB1234"
                      required
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                    />
                  </div>

                  {/* Model */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-gear me-2 text-primary"></i>Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={car.model}
                      onChange={handleChange}
                      placeholder="e.g., 2024"
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                    />
                  </div>

                  {/* Owner */}
                  <div className="col-md-6 col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person me-2 text-primary"></i>Owner
                    </label>
                    <input
                      type="text"
                      name="owner"
                      className="form-control rounded-pill shadow-sm border-2"
                      value={car.owner}
                      onChange={handleChange}
                      placeholder="e.g., John Doe"
                      style={{
                        borderColor: "#e0e7ff",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e7ff")}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-camera me-2 text-primary"></i>Car
                      Image
                    </label>
                    <div
                      className="border-2 border-dashed rounded-4 p-4 text-center position-relative"
                      style={{
                        borderColor: uploading ? "#667eea" : "#e0e7ff",
                        backgroundColor: uploading ? "#f0f4ff" : "#fafbff",
                        transition: "all 0.3s ease",
                        minHeight: "120px",
                      }}
                    >
                      <input
                        type="file"
                        className="position-absolute w-100 h-100 opacity-0"
                        style={{ cursor: "pointer", top: 0, left: 0 }}
                        onChange={handleImageUpload}
                        accept="image/*"
                        disabled={uploading}
                      />

                      {uploading ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                          <div
                            className="spinner-border text-primary mb-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="text-primary fw-semibold mb-0">
                            Uploading image...
                          </p>
                        </div>
                      ) : car.image ? (
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-check-circle-fill text-success fs-3 mb-2"></i>
                          <p className="text-success fw-semibold mb-0">
                            Image uploaded successfully!
                          </p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                          <i className="bi bi-cloud-upload fs-1 text-primary mb-2"></i>
                          <p className="text-primary fw-semibold mb-1">
                            Click to upload car image
                          </p>
                          <small className="text-muted">
                            PNG, JPG, GIF up to 10MB
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Image Preview */}
                    {car.image && (
                      <div className="text-center mt-3">
                        <div className="position-relative d-inline-block">
                          <img
                            src={car.image}
                            alt="Car Preview"
                            className="img-fluid rounded-4 shadow-lg"
                            style={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              objectFit: "cover",
                              border: "4px solid white",
                            }}
                          />
                          <div
                            className="position-absolute bg-success rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "30px",
                              height: "30px",
                              top: "-10px",
                              right: "-10px",
                            }}
                          >
                            <i className="bi bi-check text-white"></i>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Summary */}
                  {(car.carName ||
                    car.carNumber ||
                    car.model ||
                    car.owner ||
                    car.image) && (
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
                            {car.carName && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Car Name: {car.carName}
                                </small>
                              </div>
                            )}
                            {car.carNumber && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Number: {car.carNumber}
                                </small>
                              </div>
                            )}
                            {car.model && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Model: {car.model}
                                </small>
                              </div>
                            )}
                            {car.owner && (
                              <div className="col-6">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Owner: {car.owner}
                                </small>
                              </div>
                            )}
                            {car.image && (
                              <div className="col-12">
                                <small className="text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Image uploaded successfully
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={saving || uploading}
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
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Saving Car...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Car
                      </>
                    )}
                  </button>
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

export default AddCar;
