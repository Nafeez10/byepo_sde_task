import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { authenticate } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Super Admin Login
router.post("/super-admin/login", (req: Request, res: Response): any => {
  const { email, password } = req.body;
  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { id: "super-admin", role: "SUPER_ADMIN" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.json({ token, user: { role: "SUPER_ADMIN", email } });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// Organization Admin Signup
router.post(
  "/admin/signup",
  async (req: Request, res: Response): Promise<any> => {
    const { email, password, organizationId } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      const existingOrg = await prisma.organization.findFirst({
        where: { OR: [{ id: organizationId }, { name: organizationId }] },
      });
      if (existingOrg)
        return res.status(400).json({ error: "Organization ID is already in use. Please try another one." });

      await prisma.organization.create({
        data: { id: organizationId, name: organizationId },
      });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash, role: "ORG_ADMIN", organizationId },
      });

      const token = jwt.sign(
        { id: user.id, role: user.role, organizationId: user.organizationId },
        JWT_SECRET,
        { expiresIn: "1d" },
      );
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Admin Invite Signup
router.post(
  "/admin/invite-signup",
  async (req: Request, res: Response): Promise<any> => {
    const { inviteId, password } = req.body;
    try {
      const invite = await prisma.organizationInvite.findUnique({ where: { id: inviteId } });
      if (!invite || invite.role !== "ORG_ADMIN")
        return res.status(400).json({ error: "Invalid or expired invite" });

      const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email: invite.email, passwordHash, role: "ORG_ADMIN", organizationId: invite.organizationId },
      });

      await prisma.organizationInvite.delete({ where: { id: invite.id } });

      const token = jwt.sign(
        { id: user.id, role: user.role, organizationId: user.organizationId },
        JWT_SECRET,
        { expiresIn: "1d" },
      );
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// User Signup
router.post(
  "/user/signup",
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    try {
      const invite = await prisma.organizationInvite.findUnique({ where: { email } });
      if (!invite || invite.role !== "USER")
        return res.status(400).json({ error: "You must be invited by an organization first" });

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash, role: "USER", organizationId: invite.organizationId },
      });

      await prisma.organizationInvite.delete({ where: { id: invite.id } });

      const token = jwt.sign(
        { id: user.id, role: user.role, organizationId: user.organizationId },
        JWT_SECRET,
        { expiresIn: "1d" },
      );
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Common Login for Admin and User
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get Current User
router.get("/me", authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    if (req.user!.role === "SUPER_ADMIN") {
      return res.json({
        id: "super-admin",
        role: "SUPER_ADMIN",
        email: process.env.SUPER_ADMIN_EMAIL
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
