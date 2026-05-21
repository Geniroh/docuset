import { prisma } from "../config/db";
import { NotFoundError } from "../lib/errors";

export async function sendMessage(data: {
  conversationId: string;
  userId: string;
  content: string;
  documentId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify conversation belongs to this user
    const conversation = await tx.conversation.findUnique({
      where: { id: data.conversationId, userId: data.userId },
    });
    if (!conversation) throw new NotFoundError("Conversation not found");

    // 2. If a document is referenced, verify it exists and is not deleted
    if (data.documentId) {
      const doc = await tx.document.findUnique({
        where: { id: data.documentId, deletedAt: null },
      });
      if (!doc) throw new NotFoundError("Document not found");
    }

    // 3. Create user message
    const userMessage = await tx.message.create({
      data: {
        conversationId: data.conversationId,
        documentId: data.documentId,
        role: "user",
        content: data.content,
      },
    });

    // 4. Touch conversation updatedAt
    await tx.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    // 5. Placeholder assistant message (RAG pipeline in Week 4)
    const assistantMessage = await tx.message.create({
      data: {
        conversationId: data.conversationId,
        documentId: data.documentId,
        role: "assistant",
        content: "AI response placeholder (Week 4)",
        promptTokens: 0,
        completionTokens: 0,
        costUsd: 0,
      },
    });

    // 6. Log usage
    await tx.usageLog.create({
      data: {
        userId: data.userId,
        action: "chat",
        tokens: 0,
        costUsd: 0,
      },
    });

    return { userMessage, assistantMessage };
  });
}
