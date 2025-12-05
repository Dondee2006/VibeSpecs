
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const templateSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    content: z.string(),
    category: z.string()
});

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { name, description, content, category } = templateSchema.parse(req.body);

        const template = await prisma.template.create({
            data: { name, description, content, category }
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: 'Invalid input', error });
    }
};

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await prisma.template.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const template = await prisma.template.findUnique({ where: { id } });
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
