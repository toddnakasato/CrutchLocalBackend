// salesforceRoutes.ts
import { Router } from 'express';
import { salesforceQueryHandler, toolingQueryHandler } from '../controllers/salesforceController';

const router = Router();

// Base route to display "Hello Todd"
router.get('/', (req, res) => {
  res.send('Hello Todd!');
});

router.get('/salesforce/soql', salesforceQueryHandler);
router.get('/salesforce/tooling/sobjects', toolingQueryHandler);

export default router;