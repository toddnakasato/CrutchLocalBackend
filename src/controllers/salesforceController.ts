// salesforceController.ts

import { Request, Response } from 'express';
import { querySalesforce } from '../services/salesforce/soqlService';
import { getSObjectList } from '../services/salesforce/toolingService';

export const salesforceQueryHandler = async (req: Request, res: Response) => {
  const { orgName, queryName } = req.query;

  // Validate parameters
  if (!orgName || !queryName) {
    res.status(400).json({ error: 'Both orgName and queryName are required parameters.' });
    return;
  }

  try {
    // Perform the SOQL query
    const records = await querySalesforce(orgName as string, queryName as string);
    res.json({ records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toolingQueryHandler = async (req: Request, res: Response) => {
  const { orgName } = req.query;

  if (!orgName) {
    res.status(400).json({ error: 'orgName is a required parameter.' });
    return;
  }

  try {
    const sObjects = await getSObjectList(orgName as string);
    res.json({ sObjects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};