
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const projectSchema = z.object({
    name: z.string().min(1),
    summary: z.string(),
    data: z.any() // JSON blob for PRD data
});

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { name, summary, data } = projectSchema.parse(req.body);

        const project = await prisma.project.create({
            data: {
                name,
                summary,
                data: JSON.stringify(data),
                userId
            }
        });

        res.status(201).json({ ...project, data: JSON.parse(project.data) });
    } catch (error) {
        res.status(400).json({ message: 'Invalid input', error });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const parsedProjects = projects.map(p => ({
            ...p,
            data: JSON.parse(p.data)
        }));

        res.json(parsedProjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

        res.json({ ...project, data: JSON.parse(project.data) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { name, summary, data } = projectSchema.parse(req.body);

        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) return res.status(404).json({ message: 'Project not found' });
        if (existingProject.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                summary,
                data: JSON.stringify(data)
            }
        });

        res.json({ ...updatedProject, data: JSON.parse(updatedProject.data) });
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) return res.status(404).json({ message: 'Project not found' });
        if (existingProject.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

        await prisma.project.delete({ where: { id } });

        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
