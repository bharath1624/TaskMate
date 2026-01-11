import express from "express";
import { validateRequest } from "zod-express-middleware";
import { inviteMemberSchema, tokenSchema, workspaceSchema } from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { createWorkspace, getWorkspaces, getWorkspaceDetails, getWorkspaceProjects, getWorkspaceStats, getArchivedData, acceptInviteByToken, inviteUserToWorkspace, acceptGenerateInvite, updateWorkspace, transferWorkspaceOwnership, deleteWorkspace } from "../controllers/workspace.js";
import { z } from "zod";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validateRequest({ body: workspaceSchema }),
    createWorkspace
);
router.post(
    "/accept-invite-token",
    authMiddleware,
    validateRequest({ body: tokenSchema }),
    acceptInviteByToken
);
router.post(
    "/:workspaceId/invite-member",
    authMiddleware,
    validateRequest({
        params: z.object({ workspaceId: z.string() }),
        body: inviteMemberSchema,
    }),
    inviteUserToWorkspace
);
router.post(
    "/:workspaceId/accept-generate-invite",
    authMiddleware,
    validateRequest({ params: z.object({ workspaceId: z.string() }) }),
    acceptGenerateInvite
);
router.put(
    "/:workspaceId",
    authMiddleware,
    validateRequest({
        params: z.object({ workspaceId: z.string() }),
        body: workspaceSchema.partial(),
    }),
    updateWorkspace
);
router.put(
    "/:workspaceId/transfer-ownership",
    authMiddleware,
    validateRequest({
        params: z.object({ workspaceId: z.string() }),
        body: z.object({
            newOwnerId: z.string(),
        }),
    }),
    transferWorkspaceOwnership
);
router.delete(
    "/:workspaceId",
    authMiddleware,
    validateRequest({
        params: z.object({ workspaceId: z.string() }),
    }),
    deleteWorkspace
);


router.get("/", authMiddleware, getWorkspaces);
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);
router.get("/:workspaceId/archived", authMiddleware, getArchivedData);


export default router;