// soqlQuery.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getAccessToken, orgs, orgMap } = require('./connectToSalesforce'); // Import orgMap
const axios = require('axios');

// Function to connect to SQLite database
function connectToDatabase() {
  // Navigate from the 'src' folder to the 'localData' folder at the project root
  const dbPath = path.join(__dirname, '..', 'localData', 'crutchDb.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to SQLite database', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });
  return db;
}

// Function to fetch SOQL query from SQLite database based on org name and query name using async/await
async function getSoqlQuery(orgName, queryName) {
  const db = connectToDatabase();
  const query = `SELECT SoqlQuery FROM soqlQuery WHERE Org = ? AND QueryName = ?`;

  try {
    const row = await new Promise((resolve, reject) => {
      db.get(query, [orgName, queryName], (err, row) => {
        if (err) {
          reject(`Error fetching SOQL query for ${orgName} and ${queryName}: ${err.message}`);
        } else if (row) {
          resolve(row);
        } else {
          reject(`No SOQL query found for ${orgName} and ${queryName}`);
        }
      });
    });

    db.close();
    return row.SoqlQuery;
  } catch (error) {
    db.close();
    throw new Error(error);
  }
}

// Function to query Salesforce using the SOQL query from the database
async function querySalesforce(orgName, queryName) {
  const orgIndex = orgMap[orgName];
  const orgConfig = orgs[orgIndex];

  if (orgIndex === undefined || !orgConfig) {
    throw new Error(`Organization ${orgName} not found.`);
  }

  try {
    // Get SOQL query from the database
    const soqlQuery = await getSoqlQuery(orgName, queryName);

    // Get access token for the org
    const { accessToken, instanceUrl } = await getAccessToken(orgConfig);

    // Construct the query URL
    const queryUrl = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soqlQuery)}`;

    // Execute the query
    const response = await axios.get(queryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Return the records
    return response.data.records;
  } catch (error) {
    throw new Error(`Failed to query Salesforce for ${orgName} with ${queryName}: ${error.message}`);
  }
}

module.exports = {
  querySalesforce,
};