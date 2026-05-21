// import { Router } from 'express';
// import { authenticate } from '../middleware/auth';
// import { requirePermission } from '../middleware/authorize';
// import { validate } from '../middleware/validate';

// const router = Router();
// router.use(authenticate);

// // Anyone with documents:read can list documents
// router.get('/',
//   requirePermission('documents:read'),
//   validate(listDocumentsSchema),
//   listDocuments
// );

// // Only documents:create can upload
// router.post('/',
//   requirePermission('documents:create'),
//   validate(createDocumentSchema),
//   createDocument
// );

// // Only documents:delete can delete (admin only)
// router.delete('/:id',
//   requirePermission('admin:documents:delete', 'documents:delete'),
//   validate(documentParamsSchema),
//   deleteDocument
// );

// router.get('/documents/:id', conditionalGet(), getDocument);
// router.get('/conversations', conditionalGet(), listConversations);

// These STACK with the general limiter

// In document routes:
// router.post('/',
//   uploadLimiter,            // Upload-specific limit
//   requirePermission('documents:create'),
//   validate(createDocumentSchema),
//   createDocument
// );

// // In conversation routes:
// router.post('/:id/messages',
//   chatLimiter,              // Chat-specific limit
//   requirePermission('conversations:create'),
//   validate(sendMessageSchema),
//   sendMessage
// );

// export default router;
