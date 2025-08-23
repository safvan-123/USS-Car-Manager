// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/cars", require("./routes/carRoutes"));
// app.use("/api/expenses", require("./routes/expenseRoutes"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173"], // allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies/auth
  })
);

app.use(express.json());

// Routes
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
