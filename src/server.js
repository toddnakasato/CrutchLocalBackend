// server.js

require('dotenv').config();
const express = require('express');
const { connectToSalesforce } = require('./connectToSalesforce'); // Salesforce connection
const { querySalesforce } = require('./soqlQuery'); // Query-related code

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Salesforce on startup
(async () => {
  try {
    await connectToSalesforce();
    console.log('Connected to Salesforce orgs.');
  } catch (error) {
    console.error('Error connecting to Salesforce:', error);
  }
})();

// Root endpoint to display a simple welcome message
app.get('/', (req, res) => {
  res.send('Hello Todd');
});

// Endpoint to query Salesforce using parameters from SQLite
app.get('/salesforce/soql', async (req, res) => {
  const { orgName, queryName } = req.query;

  // Check if both parameters are provided
  if (!orgName || !queryName) {
    return res.status(400).json({ error: 'Both orgName and queryName are required parameters.' });
  }

  try {
    // Query Salesforce using the provided orgName and queryName
    const records = await querySalesforce(orgName, queryName);

    // Return the fetched records
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});