// connectToSalesforce.js

require('dotenv').config();
const FormData = require('form-data');
const axios = require('axios');

/*----------------------------------------------------------------------------------------------------
 *
 * Constants
 *
 ----------------------------------------------------------------------------------------------------*/
const orgs = [
  {
    name: 'FF Prod',
    consumerKey: process.env.FF_CONSUMER_KEY,
    consumerSecret: process.env.FF_CONSUMER_SECRET,
    username: process.env.FF_USERNAME,
    password: process.env.FF_PASSWORD,
  },
  {
    name: 'DFS Prod',
    consumerKey: process.env.DFS_CONSUMER_KEY,
    consumerSecret: process.env.DFS_CONSUMER_SECRET,
    username: process.env.DFS_USERNAME,
    password: process.env.DFS_PASSWORD,
  },
  // Add more orgs by adding more objects to this array
];

const orgMap = {
  'FFProd': 0,
  'DFSProd': 1,
  // Add more mappings if necessary
};

/*----------------------------------------------------------------------------------------------------
 *
 * Salesforce OAuth2.0 Access Token
 *
 ----------------------------------------------------------------------------------------------------*/
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

// Function to connect to Salesforce and test API access
async function connectToSalesforce() {
  for (const orgConfig of orgs) {
    try {
      // Get Access Token
      const { accessToken, instanceUrl } = await getAccessToken(orgConfig);
      console.log(`Access Token obtained for ${orgConfig.name}.`);

      // Test API access (optional)
      await makeApiCall(accessToken, instanceUrl, orgConfig.name);
    } catch (error) {
      console.error(`Error during Salesforce connection for ${orgConfig.name}:`, error.message);
    }
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

module.exports = {
  connectToSalesforce,
  getAccessToken,
  makeApiCall,
  orgs,
  orgMap, 
};