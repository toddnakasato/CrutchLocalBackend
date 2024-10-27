// server.ts
import dotenv from 'dotenv';
import express from 'express';
import salesforceRoutes from './routes/salesforceRoutes';
import { connectToSalesforce } from './services/salesforce/salesforceService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Salesforce routes
app.use('/api', salesforceRoutes);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Connect to Salesforce after server starts
  connectToSalesforce()
    .then(() => {
      console.log('Connected to Salesforce orgs.');
    })
    .catch((error) => {
      console.error('Error connecting to Salesforce:', error);
    });
});