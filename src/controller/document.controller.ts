// async function getDocument(req: Request, res: Response) {
//   const doc = await prisma.document.findUnique({
//     where: { id: req.params.id },
//   });

//   if (!doc) {
//     throw new NotFoundError("Document not found");
//   }

//   // Resource ownership check
//   if (doc.userId !== req.user!.id) {
//     // Admins can see everything
//     const permissions = await getUserPermissions(req.user!.id);
//     if (!permissions.has("users:manage")) {
//       throw new NotFoundError("Document not found");
//     }
//   }

//   res.json({ success: true, data: doc });
// }

// In a controller:
// const result = await documentService.createDocument({
//   ...req.body,
//   userId: req.user!.id,
//   correlationId: (req as any).correlationId,
// });

// // In the service:
// export async function createDocument(data: {
//   title: string;
//   content: string;
//   userId: string;
//   correlationId: string;

// In a controller:
// const result = await documentService.createDocument({
//   ...req.body,
//   userId: req.user!.id,
//   correlationId: (req as any).correlationId,
// });

// // In the service:
// export async function createDocument(data: {
//   title: string;
//   content: string;
//   userId: string;
//   correlationId: string;
// }) {
//   logger.info('Creating document', {
//     correlationId: data.correlationId,
//     userId: data.userId,
//     title: data.title,
//   });
//   // ... rest of the function
// }

// For queue jobs, pass the correlation ID as part of the job data:

// When queueing:
// await documentQueue.add('process-document', {
//   documentId: doc.id,
//   userId: data.userId,
//   correlationId: data.correlationId,  // Carry it into the job
// });

// In the worker:
// const { documentId, correlationId } = job.data;
// logger.info('Processing document', { correlationId, documentId });
