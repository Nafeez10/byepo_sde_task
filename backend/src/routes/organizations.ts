import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Super Admin creates an organization
router.post('/', requireRole(['SUPER_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const { name, adminEmail } = req.body;
  if (!adminEmail) return res.status(400).json({ error: 'Admin email is required' });

  try {
    const existing = await prisma.organization.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ error: 'Organization name already exists' });

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) return res.status(400).json({ error: 'Admin email is already registered' });

    const existingInvite = await prisma.organizationInvite.findUnique({ where: { email: adminEmail } });
    if (existingInvite) return res.status(400).json({ error: 'Admin email is already invited' });

    const org = await prisma.organization.create({ data: { name } });
    
    const invite = await prisma.organizationInvite.create({
      data: {
        email: adminEmail,
        organizationId: org.id,
        role: 'ORG_ADMIN'
      }
    });

    const inviteLink = `http://localhost:3001/signup/invite?inviteId=${invite.id}`;
    
    return res.json({ organization: org, inviteLink });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Super Admin lists organizations (or users can list them to select for signup)
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const orgs = await prisma.organization.findMany();
    return res.json(orgs);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Org Admin invites a user
router.post('/invites', requireRole(['ORG_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const existingInvite = await prisma.organizationInvite.findUnique({ where: { email } });
    if (existingInvite) return res.status(400).json({ error: 'Email already invited' });

    const invite = await prisma.organizationInvite.create({
      data: {
        email,
        organizationId: req.user!.organizationId!,
        role: 'USER'
      }
    });
    return res.json(invite);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
