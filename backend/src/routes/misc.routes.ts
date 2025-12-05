
import { Router } from 'express';
import { createTemplate, getTemplates, getTemplateById } from '../controllers/template.controller';
import { getPlans, seedPlans } from '../controllers/billing.controller';

export const templateRouter = Router();
templateRouter.get('/', getTemplates);
templateRouter.get('/:id', getTemplateById);
templateRouter.post('/', createTemplate); // Ideally protected for admin

export const billingRouter = Router();
billingRouter.get('/plans', getPlans);
billingRouter.post('/seed', seedPlans); // Dev util
