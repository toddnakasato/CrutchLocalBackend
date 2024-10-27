// toolingQuery.ts

import axios from 'axios';
import { getAccessToken, orgs, orgMap } from './connectToSalesforce';

// Function to get a list of sObjects using the Tooling API
export async function getSObjectList(orgName: string): Promise<any[]> {
  const orgIndex = orgMap[orgName];
  const orgConfig = orgs[orgIndex];

  if (orgIndex === undefined || !orgConfig) {
    throw new Error(`Organization ${orgName} not found.`);
  }

  try {
    // Get access token for the org
    const { accessToken, instanceUrl } = await getAccessToken(orgConfig);

    // Construct the tooling API URL for sObjects
    const toolingUrl = `${instanceUrl}/services/data/v58.0/tooling/sobjects`;

    // Execute the request to get a list of sObjects
    const response = await axios.get(toolingUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Return the list of sObjects
    return response.data.sobjects;
  } catch (error: any) {
    throw new Error(`Failed to retrieve sObjects for ${orgName}: ${error.message}`);
  }
}