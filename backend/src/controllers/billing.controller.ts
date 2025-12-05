
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlans = async (req: Request, res: Response) => {
    try {
        const plans = await prisma.billingPlan.findMany();
        // Parse features JSON if stored as string, though our API might just return the string
        // Let's assume frontend wants parsed JSON
        const parsedPlans = plans.map(p => ({
            ...p,
            features: JSON.parse(p.features)
        }));
        res.json(parsedPlans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const seedPlans = async (req: Request, res: Response) => {
    // Only for dev/admin usage
    try {
        await prisma.billingPlan.deleteMany(); // Clear existing

        const plans = [
            {
                name: 'Free',
                price: 0,
                features: JSON.stringify(['3 Projects', 'Basic Templates', 'Community Support'])
            },
            {
                name: 'Pro',
                price: 19,
                features: JSON.stringify(['Unlimited Projects', 'Premium Templates', 'Priority Support', 'AI Generation'])
            },
            {
                name: 'Team',
                price: 49,
                features: JSON.stringify(['Everything in Pro', 'Team Collaboration', 'Admin Dashboard'])
            }
        ];

        for (const plan of plans) {
            await prisma.billingPlan.create({ data: plan });
        }

        res.json({ message: 'Plans seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding plans', error });
    }
};
