const express = require("express");
const userRoutes = require("./routes/userRoutes");
const bloodSampleRoutes = require("./routes/bloodSampleRoutes");
const approvalRequestRoutes = require("./routes/requestRoutes");
const alertRoutes = require("./routes/alertRoutes");
const postRoutes = require("./routes/postRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/bloodSample", bloodSampleRoutes);
app.use("/api/approvalRequest", approvalRequestRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
