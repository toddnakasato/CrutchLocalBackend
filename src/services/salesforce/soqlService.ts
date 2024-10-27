import sqlite3 from 'sqlite3';
import path from 'path';
import axios from 'axios';
import { getAccessToken, orgs, orgMap } from './salesforceService';

function connectToDatabase(): sqlite3.Database {
  const dbPath = path.join(__dirname, '..', '..', 'localData', 'crutchDb.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to SQLite database', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });
  return db;
}

async function getSoqlQuery(orgName: string, queryName: string): Promise<string> {
  const db = connectToDatabase();
  const query = `SELECT SoqlQuery FROM soqlQuery WHERE Org = ? AND QueryName = ?`;

  try {
    const row = await new Promise<{ SoqlQuery: string }>((resolve, reject) => {
      db.get(query, [orgName, queryName], (err, row: { SoqlQuery?: string } | undefined) => {
        if (err) {
          reject(`Error fetching SOQL query for ${orgName} and ${queryName}: ${err.message}`);
        } else if (row && typeof row.SoqlQuery === 'string') {
          resolve({ SoqlQuery: row.SoqlQuery });
        } else {
          reject(`No SOQL query found for ${orgName} and ${queryName}`);
        }
      });
    });

    db.close();
    return row.SoqlQuery;
  } catch (error) {
    db.close();
    throw new Error(error as string);
  }
}

export async function querySalesforce(orgName: string, queryName: string): Promise<any[]> {
  const orgIndex = orgMap[orgName];
  const orgConfig = orgs[orgIndex];

  if (orgIndex === undefined || !orgConfig) {
    throw new Error(`Organization ${orgName} not found.`);
  }

  try {
    const soqlQuery = await getSoqlQuery(orgName, queryName);
    const { accessToken, instanceUrl } = await getAccessToken(orgConfig);
    const queryUrl = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(soqlQuery)}`;

    const response = await axios.get(queryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.records;
  } catch (error: any) {
    throw new Error(`Failed to query Salesforce for ${orgName} with ${queryName}: ${error.message}`);
  }
}