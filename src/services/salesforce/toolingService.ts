import axios from 'axios';
import { getAccessToken, orgs, orgMap } from './salesforceService';

// Function to get a list of sObjects using the Tooling API
export async function getSObjectList(orgName: string): Promise<any[]> {
  const orgIndex = orgMap[orgName];
  const orgConfig = orgs[orgIndex];

  if (orgIndex === undefined || !orgConfig) {
    throw new Error(`Organization ${orgName} not found.`);
  }

  try {
    const { accessToken, instanceUrl } = await getAccessToken(orgConfig);
    const toolingUrl = `${instanceUrl}/services/data/v58.0/tooling/sobjects`;

    const response = await axios.get(toolingUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.sobjects;
  } catch (error: any) {
    throw new Error(`Failed to retrieve sObjects for ${orgName}: ${error.message}`);
  }
}