const app = require('./app');

// Define server port from environment variable or fallback to 3000
const PORT = process.env.PORT || 3000;

// Start listening for incoming requests
app.listen(PORT, () => {
  console.log(`LMS Server is running on port ${PORT}`);
});
