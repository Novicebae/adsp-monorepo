import * as path from 'path';
import * as appRoot from 'app-root-path';
import { Router } from 'express';
import * as validFilename from 'valid-filename';
import { Logger } from 'winston';
import {
  User,
  assertAuthenticatedHandler,
  UnauthorizedError,
  NotFoundError,
  InvalidOperationError,
  DomainEventService,
  platformURNs,
} from '@core-services/core-common';
import { FileRepository, FileSpaceRepository } from '../repository';
import { FileEntity } from '../model';
import { createUpload } from '../upload';
import { createdFile, deletedFile } from '../event';
import { FileCriteria } from '../types/file';

interface FileRouterProps {
  logger: Logger;
  rootStoragePath: string;
  eventService: DomainEventService;
  spaceRepository: FileSpaceRepository;
  fileRepository: FileRepository;
}

export const createFileRouter = ({
  logger,
  rootStoragePath,
  eventService,
  spaceRepository,
  fileRepository,
}: FileRouterProps) => {
  const upload = createUpload({ rootStoragePath });
  const fileRouter = Router();

  /**
   * @swagger
   *
   * /file/v1/files:
   *   post:
   *     tags:
   *     - File
   *     description: Upload a file.
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               space:
   *                 type: string
   *                 description: Space to upload the file to.
   *               type:
   *                 type: string
   *                 description: Type of the file.
   *               recordId:
   *                 type: string
   *                 description: ID of the record associated with the file.
   *               filename:
   *                 type: string
   *                 description: Name of the file.
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Contents of the file.
   *     responses:
   *       200:
   *         description: File successfully uploaded.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 filename:
   *                   type: string
   *                 size:
   *                   type: number
   *       400:
   *         description: Invalid parameters.
   *       404:
   *         description: Space or type not found.
   */
  fileRouter.post('/files', assertAuthenticatedHandler, upload.single('file'), async (req, res, next) => {
    const user = req.user as User;
    const { type, recordId, filename } = req.body;
    const uploaded = req.file;

    if (filename && !validFilename(filename)) {
      throw new InvalidOperationError(`Specified filename is not valid.`);
    }

    try {
      if (!uploaded || !type) {
        res.sendStatus(400);
      } else {
        const space = await spaceRepository.getIdByName(user.tenantName);
        const spaceEntity = await spaceRepository.get(space);

        if (!spaceEntity) {
          throw new NotFoundError('Space', space);
        }

        const fileType = spaceEntity.types[type];

        if (!fileType) {
          throw new NotFoundError('Type', type);
        }
        const fileEntity = await FileEntity.create(
          user,
          fileRepository,
          fileType,
          {
            filename: filename || uploaded.originalname,
            size: uploaded.size,
            recordId,
          },
          uploaded.path,
          rootStoragePath
        );
        eventService.send(
          createdFile(space, type, {
            id: fileEntity.id,
            filename: fileEntity.filename,
            size: fileEntity.size,
            recordId: fileEntity.recordId,
            createdBy: fileEntity.createdBy,
            created: fileEntity.created,
            scanned: fileEntity.scanned,
          })
        );

        res.json({
          id: fileEntity.id,
          filename: fileEntity.filename,
          size: fileEntity.size,
          typeName: fileEntity.type.name,
          recordId: fileEntity.recordId,
          created: fileEntity.created,
          lastAccessed: fileEntity.lastAccessed,
          fileURN: `${platformURNs['file-service']}:${spaceEntity.name}/supporting-doc/${fileEntity.id}`,
        });

        logger.info(
          `File '${fileEntity.filename}' (ID: ${fileEntity.id}) uploaded by ` + `user '${user.name}' (ID: ${user.id}).`
        );
      }
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   *
   * /file/v1/files:
   *   get:
   *     tags:
   *     - File
   *     description: Retrieves file list metadata.
   *     parameters:
   *     responses:
   *       200:
   *         description: File metadata
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               properties:
   *                 id:
   *                   type: string
   *                 filename:
   *                   type: string
   *                 size:
   *                   type: number
   *                 fileURN:
   *                   type: string
   *       404:
   *         description: file not found
   */
  fileRouter.get('/files', async (req, res, next) => {
    const user = req.user as User;
    const { top, after } = req.query;

    try {
      const spaceId = await spaceRepository.getIdByName(user.tenantName);
      const criteria: FileCriteria = {
        spaceEquals: spaceId,
        deleted: false,
      };
      const files = await fileRepository.find(parseInt((top as string) || '50', 50), after as string, criteria);

      if (!files) {
        throw new NotFoundError(`There is no file in ${spaceId}`, spaceId);
      }

      res.send({
        page: files.page,
        results: files.results.map((n) => ({
          id: n.id,
          filename: n.filename,
          size: n.size,
          typeName: n.type.name,
          recordId: n.recordId,
          created: n.created,
          lastAccessed: n.lastAccessed,
          fileURN: `${platformURNs['file-service']}:${user.tenantName}/supporting-doc/${n.id}`,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   *
   * /file/v1/files/{fileId}:
   *   get:
   *     tags:
   *     - File
   *     description: Retrieves a file's metadata.
   *     parameters:
   *     - name: fileId
   *       description: ID of the file to retrieve.
   *       in: path
   *       required: true
   *       schema:
   *         type: string
   *     responses:
   *       200:
   *         description: File metadata
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 filename:
   *                   type: string
   *                 size:
   *                   type: number
   *                 scanned:
   *                   type: boolean
   *                 deleted:
   *                   type: boolean
   *       404:
   *         description: file not found
   */
  fileRouter.get('/files/:fileId', async (req, res, next) => {
    const user = req.user as User;
    const { fileId } = req.params;
    try {
      const fileEntity = await fileRepository.get(fileId);

      if (!fileEntity) {
        throw new NotFoundError('File', fileId);
      } else if (!fileEntity.canAccess(user)) {
        throw new UnauthorizedError('User not authorized to access file.');
      }

      res.json({
        id: fileEntity.id,
        filename: fileEntity.filename,
        size: fileEntity.size,
        typeName: fileEntity.type.name,
        recordId: fileEntity.recordId,
        created: fileEntity.created,
        lastAccessed: fileEntity.lastAccessed,
        fileURN: `${platformURNs['file-service']}:${user.tenantName}/supporting-doc/${fileEntity.id}`,
        scanned: fileEntity.scanned,
        deleted: fileEntity.deleted,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   *
   * /file/v1/files/{fileId}/download:
   *   get:
   *     tags:
   *     - File
   *     description: Downloads a file.
   *     parameters:
   *     - name: fileId
   *       description: ID of the file to download.
   *       in: path
   *       required: true
   *       schema:
   *         type: string
   *     responses:
   *       200:
   *         description: File binary content
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: file not found
   */
  fileRouter.get('/files/:fileId/download', async (req, res, next) => {
    const user = req.user as User;
    const { fileId } = req.params;
    try {
      const fileEntity = await fileRepository.get(fileId);
      if (!fileEntity || fileEntity.deleted) {
        throw new NotFoundError('File', fileId);
      } else if (!fileEntity.canAccess(user)) {
        throw new UnauthorizedError('User not authorized to access file.');
      } else if (!fileEntity.scanned) {
        throw new InvalidOperationError('File scan pending.');
      } else {
        const filePath = path.resolve(`${appRoot}`, await fileEntity.getFilePath(rootStoragePath));
        res.sendFile(filePath, {
          headers: {
            'Content-Disposition': `attachment; filename="${fileEntity.filename}"`,
            'Cache-Control': 'public',
          },
        });
        fileEntity.accessed();
      }
    } catch (err) {
      next(err);
    }
  });

  /**
   * @swagger
   *
   * /file/v1/files/{fileId}:
   *   delete:
   *     tags:
   *     - File
   *     description: Marks a file for deletion.
   *     parameters:
   *     - name: fileId
   *       description: ID of the file to delete.
   *       in: path
   *       required: true
   *       schema:
   *         type: string
   *     responses:
   *       200:
   *         description: Delete result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 deleted:
   *                   type: boolean
   *       404:
   *         description: file not found
   */
  fileRouter.delete('/files/:fileId', assertAuthenticatedHandler, async (req, res, next) => {
    const user = req.user as User;
    const { fileId } = req.params;
    try {
      const fileEntity = await fileRepository.get(fileId);

      if (!fileEntity) {
        throw new NotFoundError('File', fileId);
      }
      fileEntity.markForDeletion(user);

      eventService.send(
        deletedFile(
          fileEntity.type.spaceId,
          fileEntity.type.id,
          {
            id: fileEntity.id,
            filename: fileEntity.filename,
            size: fileEntity.size,
            recordId: fileEntity.recordId,
            createdBy: fileEntity.createdBy,
            created: fileEntity.created,
            scanned: fileEntity.scanned,
          },
          user,
          new Date()
        )
      );

      logger.info(
        `File '${fileEntity.filename}' (ID: ${fileEntity.id}) marked for deletion by ` +
          `user '${user.name}' (ID: ${user.id}).`
      );

      res.json({ deleted: fileEntity.deleted });
    } catch (err) {
      next(err);
    }
  });

  return fileRouter;
};
