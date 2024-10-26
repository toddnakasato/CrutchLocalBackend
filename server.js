// server.js

require('dotenv').config();
const express = require('express');
const salesforce = require('./salesforce');

const app = express();
const port = process.env.PORT || 3000;

// Middleware (if needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Salesforce on startup
(async () => {
  try {
    await salesforce.connectToSalesforce();
    console.log('Connected to Salesforce orgs.');
  } catch (error) {
    console.error('Error connecting to Salesforce:', error);
  }
})();

// Test endpoint to fetch leads from the first configured Salesforce org
app.get('/hello/leads', async (req, res) => {
    try {
      // Fetch leads from the first org (index 0)
      const leads = await querySalesforceLeads(0);
  
      // Return the fetched leads
      res.json({ leads });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});