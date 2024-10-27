// server.ts

import dotenv from 'dotenv';
import express, { Request, Response, RequestHandler } from 'express';
import { connectToSalesforce } from './connectToSalesforce';
import { querySalesforce } from './soqlQuery';
import { getSObjectList } from './toolingQuery'; // Import the function

dotenv.config();

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
app.get('/', (req: Request, res: Response) => {
    res.send('Hello Todd!');
});

// Endpoint to query Salesforce using parameters from SQLite
const salesforceQueryHandler: RequestHandler = async (req, res) => {
    const { orgName, queryName } = req.query;

    // Check if both parameters are provided
    if (!orgName || !queryName) {
        res.status(400).json({ error: 'Both orgName and queryName are required parameters.' });
        return;
    }

    try {
        // Query Salesforce using the provided orgName and queryName
        const records = await querySalesforce(orgName as string, queryName as string);

        // Return the fetched records
        res.json({ records });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Use the handler in the route
app.get('/salesforce/soql', salesforceQueryHandler);

// Step 2: Add a new route to test the Tooling API
const toolingQueryHandler: RequestHandler = async (req, res) => {
    const { orgName } = req.query;

    // Check if the parameter is provided
    if (!orgName) {
        res.status(400).json({ error: 'orgName is a required parameter.' });
        return;
    }

    try {
        // Query the Tooling API using the provided orgName
        const sObjects = await getSObjectList(orgName as string);

        // Return the list of sObjects
        res.json({ sObjects });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Use the tooling query handler in the route
app.get('/salesforce/tooling/sobjects', toolingQueryHandler);

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
