import { prisma } from "../config/db";
import { DOC_EVENTS } from "../events";
import { NotFoundError } from "../lib/errors";
import { appEvents } from "../lib/event";

interface ListDocumentsOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "chunkCount";
  sortOrder?: "asc" | "desc";
}

export async function listDocuments(
  userId: string,
  options: ListDocumentsOptions,
) {
  const {
    page,
    limit,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const where: any = {
    userId,
    deletedAt: null, // Soft delete filter (we'll add this today)
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
    where.description = { contains: search, mode: "insensitive" };
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        filename: true,
        status: true,
        chunkCount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.document.count({ where }),
  ]);

  return {
    data: documents,
    meta: { page, limit, total },
  };
}

export async function deleteDocument(documentId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc || doc.deletedAt) {
    throw new NotFoundError("Document not found");
  }
  // Ownership check
  if (doc.userId !== userId) {
    throw new NotFoundError("Document not found");
  }

  appEvents.emit(DOC_EVENTS.DELETED, {
    deletedBy: userId,
    documentId: doc.id,
    title: doc.title,
  });

  return prisma.document.update({
    where: { id: documentId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
}

export async function createDocument(data: any) {}

export async function getDocument(documentId: string, userId: string) {}
