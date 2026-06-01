// Audit logging — A9 OWASP
// Registra eventos de seguridad en la tabla audit_logs

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { hashIp } from "@/lib/utils";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "niche_evaluation_created"
  | "ai_query"
  | "youtube_search"
  | "action_item_completed"
  | "user_data_updated"
  | "unauthorized_access";

export interface AuditEventData {
  userId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function logAuditEvent(event: AuditEventData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,
        ipHash: event.ip ? hashIp(event.ip) : null,
      },
    });
  } catch {
    // Audit failures should never break the main flow — silently log to stderr
    console.error("[audit] Failed to log event:", event.action);
  }
}

export async function checkLoginAttempts(
  userId: string,
  windowMinutes = 15
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  return prisma.auditLog.count({
    where: {
      userId,
      action: "login_failed",
      timestamp: { gte: since },
    },
  });
}
