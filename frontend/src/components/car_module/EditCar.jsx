import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCar = () => {
  const { id } = useParams(); // Get car id from URL
  const [car, setCar] = useState({
    carName: "",
    carNumber: "",
    model: "",
    owner: "",
    image: "",
  });

  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch car details by ID
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(res.data);
      } catch (err) {
        console.error("Error fetching car:", err);
      }
    };
    fetchCar();
  }, [id]);

  // Handle text inputs
  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  // Handle Cloudinary image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // 🔹 Replace with your Cloudinary preset

    try {
      setUploading(true);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dmsybcze6/image/upload`, // 🔹 Replace with your Cloudinary cloud name
        formData
      );

      setCar({ ...car, image: res.data.secure_url });
      setUploading(false);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploading(false);
    }
  };

  // Handle update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/cars/${id}`, car);
      navigate("/");
    } catch (err) {
      console.error("Error updating car:", err);
    }
  };

  return (
    <div className="card p-4 shadow">
      <h3>Edit Car</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Car Name</label>
          <input
            type="text"
            name="carName"
            className="form-control"
            value={car.carName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label>Car Number</label>
          <input
            type="text"
            name="carNumber"
            className="form-control"
            value={car.carNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label>Model</label>
          <input
            type="text"
            name="model"
            className="form-control"
            value={car.model}
            onChange={handleChange}
          />
        </div>

        <div className="mb-2">
          <label>Owner</label>
          <input
            type="text"
            name="owner"
            className="form-control"
            value={car.owner}
            onChange={handleChange}
          />
        </div>

        <div className="mb-2">
          <label>Upload Image</label>
          <input
            type="file"
            className="form-control"
            onChange={handleImageUpload}
            accept="image/*"
          />
          {uploading && <p>Uploading...</p>}
          {car.image && (
            <img
              src={car.image}
              alt="Car Preview"
              style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }}
            />
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Update Car
        </button>
      </form>
    </div>
  );
};

export default EditCar;
