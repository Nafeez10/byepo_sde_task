import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// List feature flags (Org Admin only)
router.get('/', requireRole(['ORG_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  try {
    const flags = await prisma.featureFlag.findMany({
      where: { organizationId: req.user!.organizationId },
    });
    return res.json(flags);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create feature flag (Org Admin only)
router.post('/', requireRole(['ORG_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const { key, isEnabled } = req.body;
  try {
    const existing = await prisma.featureFlag.findUnique({
      where: {
        organizationId_key: {
          organizationId: req.user!.organizationId!,
          key,
        },
      },
    });
    if (existing) return res.status(400).json({ error: 'Feature flag already exists' });

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        isEnabled: isEnabled || false,
        organizationId: req.user!.organizationId!,
      },
    });
    return res.json(flag);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feature flag (Org Admin only)
router.patch('/:id', requireRole(['ORG_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { isEnabled, key } = req.body;
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { id } });
    if (!flag || flag.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    const updated = await prisma.featureFlag.update({
      where: { id },
      data: { isEnabled, key },
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete feature flag (Org Admin only)
router.delete('/:id', requireRole(['ORG_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { id } });
    if (!flag || flag.organizationId !== req.user!.organizationId) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    await prisma.featureFlag.delete({ where: { id } });
    return res.json({ message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// List feature keys for an organization (accessible to all authenticated users)
router.get('/keys', async (req: Request, res: Response): Promise<any> => {
  try {
    const flags = await prisma.featureFlag.findMany({
      where: { organizationId: req.user!.organizationId },
      select: { key: true }
    });
    return res.json(flags.map(f => f.key));
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Check feature flag (End User or Org Admin)
router.get('/check', async (req: Request, res: Response): Promise<any> => {
  const keyParam = req.query.key as string;
  const keysParam = req.query.keys as string;

  if (!keyParam && !keysParam) {
    return res.status(400).json({ error: 'Missing feature key(s)' });
  }

  try {
    if (keysParam) {
      const keys = keysParam.split(',').map(k => k.trim()).filter(Boolean);
      const flags = await prisma.featureFlag.findMany({
        where: {
          organizationId: req.user!.organizationId!,
          key: { in: keys }
        }
      });
      
      const results = keys.map(k => {
        const flag = flags.find(f => f.key === k);
        if (!flag) {
          return { key: k, enabled: false, message: 'Feature flag not found' };
        }
        return { key: k, enabled: flag.isEnabled };
      });
      return res.json(results);
    } else {
      const flag = await prisma.featureFlag.findUnique({
        where: {
          organizationId_key: {
            organizationId: req.user!.organizationId!,
            key: keyParam,
          },
        },
      });

      if (!flag) {
        return res.json({ enabled: false, message: 'Feature flag not found' });
      }

      return res.json({ enabled: flag.isEnabled });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
