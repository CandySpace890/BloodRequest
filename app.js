const express = require("express");
const userRoutes = require("./routes/userRoutes");
const bloodSampleRoutes = require("./routes/bloodSampleRoutes");
const approvalRequestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const preflightRoutes = require("./preflightRoutes"); // Import preflight route

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/users", userRoutes);
app.use("/api/bloodSample", bloodSampleRoutes);
app.use("/api/approvalRequest", approvalRequestRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/", preflightRoutes); // Use the preflight route
app.get("/ok",(req,res) => res.json("Hey buddy, server is up and running"));

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
