import { prisma } from "@/lib/db/prisma";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "INVITATION" | "RESULT";
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || "INFO",
        isRead: false,
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
