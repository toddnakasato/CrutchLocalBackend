// salesforce.js

require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');

// Array of org configurations
const orgs = [
  {
    name: 'FF',
    consumerKey: process.env.FF_CONSUMER_KEY,
    consumerSecret: process.env.FF_CONSUMER_SECRET,
    username: process.env.FF_USERNAME,
    password: process.env.FF_PASSWORD, 
  },
  {
    name: 'DFS',
    consumerKey: process.env.DFS_CONSUMER_KEY,
    consumerSecret: process.env.DFS_CONSUMER_SECRET,
    username: process.env.DFS_USERNAME,
    password: process.env.DFS_PASSWORD, 
  },
  // Add more orgs by adding more objects to this array
];

async function getAccessToken(orgConfig) {
    const form = new FormData();
    form.append('grant_type', 'password');
    form.append('client_id', orgConfig.consumerKey);
    form.append('client_secret', orgConfig.consumerSecret);
    form.append('username', orgConfig.username);
    form.append('password', orgConfig.password); // Password + Security Token
  
    try {
      const response = await axios.post('https://login.salesforce.com/services/oauth2/token', form, {
        headers: {
          ...form.getHeaders(),
        },
      });
  
      return {
        accessToken: response.data.access_token,
        instanceUrl: response.data.instance_url,
      };
    } catch (error) {
      throw new Error(`Failed to fetch token for ${orgConfig.name}: ${error.message}`);
    }
  }

// Function to execute a SOQL query to fetch leads for a specific org index
async function querySalesforceLeads(orgIndex) {
    const orgConfig = orgs[orgIndex];
  
    if (!orgConfig) {
      throw new Error(`Organization at index ${orgIndex} not found.`);
    }
  
    try {
      // Get access token within this method
      const { accessToken, instanceUrl } = await getAccessToken(orgConfig);
      console.log(`Access Token obtained for ${orgConfig.name}.`);
  
      // Construct the SOQL query
      const soqlQuery = encodeURIComponent('SELECT Id, FirstName, LastName, Email FROM Lead LIMIT 100');
      const queryUrl = `${instanceUrl}/services/data/v58.0/query/?q=${soqlQuery}`;
  
      // Execute the query
      const response = await axios.get(queryUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Log the full response data for debugging
      console.log('Full Response Data:', response.data);
  
      // Check if records exist in the response
      if (response.data && response.data.records) {
        console.log('Records:', response.data.records);
        return response.data.records;
      } else {
        throw new Error('No records found in the response.');
      }
    } catch (error) {
      throw new Error(`Failed to fetch Leads for ${orgConfig.name}: ${error.response ? error.response.data : error.message}`);
    }
  }
  

async function makeApiCall(accessToken, instanceUrl, orgName) {
  try {
    const response = await axios.get(`${instanceUrl}/services/data/v58.0/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(`API Response from ${orgName}:`, response.data);
  } catch (error) {
    console.error(`Error making API call to ${orgName}:`, error.response ? error.response.data : error.message);
  }
}

async function connectToSalesforce() {
  for (const orgConfig of orgs) {
    try {
      // Get Access Token
      const { accessToken, instanceUrl } = await getAccessToken(orgConfig);
      console.log(`Access Token obtained for ${orgConfig.name}.`);

      // Make API Call
      await makeApiCall(accessToken, instanceUrl, orgConfig.name);
    } catch (error) {
      console.error(`Error during Salesforce connection for ${orgConfig.name}:`, error.message);
    }
  }
}

module.exports = {
  connectToSalesforce,
  querySalesforceLeads
};
