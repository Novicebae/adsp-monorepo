import { rename, unlink } from 'fs';
import { Mock, It } from 'moq.ts';
import { adspId, User } from '@abgov/adsp-service-sdk';
import { UnauthorizedError, InvalidOperationError } from '@core-services/core-common';
import { FileRepository } from '../repository';
import { FileRecord } from '../types';
import { FileEntity } from './file';
import { FileTypeEntity } from './type';

jest.mock('fs', () => ({
  rename: jest.fn((o, n, cb) => cb(null)),
  unlink: jest.fn((o, cb) => cb(null)),
}));
const renameMock = (rename as unknown) as jest.Mock<typeof rename>;
const unlinkMock = (unlink as unknown) as jest.Mock<typeof unlink>;

describe('File Entity', () => {
  const user: User = {
    id: 'user-2',
    name: 'testy',
    email: 'test@testco.org',
    roles: ['test-admin'],
    tenantId: adspId`urn:ads:platform:tenant-service:v2:/tenants/test`,
    isCore: false,
    token: null,
  };

  const storagePath = 'files';
  const typePath = `${storagePath}/test/file-type-1`;
  let repositoryMock: Mock<FileRepository> = null;
  let typeMock: Mock<FileTypeEntity> = null;

  beforeEach(() => {
    renameMock.mockClear();
    unlinkMock.mockClear();

    repositoryMock = new Mock<FileRepository>();
    typeMock = new Mock<FileTypeEntity>();
  });

  it('can be initialized for new record', () => {
    const file = {
      filename: 'test.txt',
      recordId: 'my-record-1',
      size: 100,
      created: new Date(),
      createdBy: {
        id: 'user-1',
        name: 'testy',
      },
    };

    const entity = new FileEntity(repositoryMock.object(), typeMock.object(), file);

    expect(entity).toBeTruthy();
    expect(entity.id).toBeTruthy();
    expect(entity.storage).toBeTruthy();
    expect(entity.filename).toEqual(file.filename);
    expect(entity.recordId).toEqual(file.recordId);
    expect(entity.size).toEqual(file.size);
    expect(entity.created).toEqual(file.created);
    expect(entity.createdBy).toEqual(file.createdBy);
    expect(entity.scanned).toBeFalsy();
    expect(entity.deleted).toBeFalsy();
  });

  it('can be initialized for existing record', () => {
    const file: FileRecord = {
      id: 'file-1',
      storage: 'file-store-1',
      filename: 'test.txt',
      recordId: 'my-record-1',
      size: 100,
      created: new Date(),
      createdBy: {
        id: 'user-1',
        name: 'testy',
      },
      scanned: false,
      deleted: true,
    };

    const entity = new FileEntity(repositoryMock.object(), typeMock.object(), file);

    expect(entity).toBeTruthy();
    expect(entity.id).toEqual(file.id);
    expect(entity.storage).toEqual(file.storage);
    expect(entity.filename).toEqual(file.filename);
    expect(entity.recordId).toEqual(file.recordId);
    expect(entity.size).toEqual(file.size);
    expect(entity.created).toEqual(file.created);
    expect(entity.createdBy).toEqual(file.createdBy);
    expect(entity.scanned).toEqual(false);
    expect(entity.deleted).toEqual(true);
  });

  it('can create new', async (done) => {
    typeMock.setup((m) => m.canUpdateFile(It.IsAny())).returns(true);

    typeMock.setup((m) => m.getPath(It.Is<string>((storage) => !!storage))).returns(typePath);

    repositoryMock.setup((m) => m.save(It.IsAny())).callback((i) => Promise.resolve(i.args[0]));

    const file = {
      filename: 'test.txt',
      recordId: 'my-record-1',
      size: 100,
      created: new Date(),
      createdBy: {
        id: 'user-1',
        name: 'testy',
      },
    };

    const fileEntity = await FileEntity.create(
      user,
      repositoryMock.object(),
      typeMock.object(),
      file,
      'tmp-file',
      storagePath
    );

    expect(fileEntity).toBeTruthy();
    expect(renameMock.mock.calls[0][0]).toEqual('tmp-file');
    expect(renameMock.mock.calls[0][1]).toEqual(`${typePath}/${fileEntity.storage}`);
    done();
  });

  it('can prevent unauthorized user create new', async (done) => {
    typeMock.setup((m) => m.canUpdateFile(It.IsAny())).returns(false);

    const file = {
      filename: 'test.txt',
      recordId: 'my-record-1',
      size: 100,
      created: new Date(),
      createdBy: {
        id: 'user-1',
        name: 'testy',
      },
    };

    try {
      await FileEntity.create(user, repositoryMock.object(), typeMock.object(), file, 'tmp-file', storagePath);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedError);
      done();
    }
  });

  describe('instance', () => {
    let entity: FileEntity = null;
    beforeEach(() => {
      const file: FileRecord = {
        id: 'file-1',
        storage: 'file-store-1',
        filename: 'test.txt',
        recordId: 'my-record-1',
        size: 100,
        created: new Date(),
        createdBy: {
          id: 'user-1',
          name: 'testy',
        },
        scanned: false,
        deleted: false,
      };

      entity = new FileEntity(repositoryMock.object(), typeMock.object(), file);

      typeMock.setup((m) => m.canUpdateFile(user)).returns(true);

      typeMock.setup((m) => m.getPath(storagePath)).returns(typePath);

      repositoryMock.setup((m) => m.save(entity)).returns(Promise.resolve(entity));
    });

    it('can get file path', () => {
      const path = entity.getFilePath(storagePath);
      expect(path).toEqual(`${typePath}/${entity.storage}`);
    });

    it('can check user access for user with access to type', () => {
      typeMock.setup((m) => m.canAccessFile(user)).returns(true);

      const canAccess = entity.canAccess(user);
      expect(canAccess).toBeTruthy();
    });

    it('can check user access for user without access to type', () => {
      typeMock.setup((m) => m.canAccessFile(user)).returns(false);

      const canAccess = entity.canAccess(user);
      expect(canAccess).toBeFalsy();
    });

    it('can record access', (done) => {
      const accessed = new Date();
      entity.accessed(accessed).then((result) => {
        expect(result.lastAccessed).toEqual(accessed);
        done();
      });
    });

    it('can record access with current date and time', (done) => {
      const accessed = new Date();
      entity.accessed().then((result) => {
        expect(result.lastAccessed >= accessed).toBeTruthy();
        done();
      });
    });

    it('can mark for delete', (done) => {
      entity.markForDeletion(user).then((result) => {
        expect(result.deleted).toEqual(true);
        done();
      });
    });

    it('can prevent unauthorized user from marking file for delete', () => {
      typeMock.setup((m) => m.canUpdateFile(user)).returns(false);

      expect(() => {
        entity.markForDeletion(user);
      }).toThrowError(UnauthorizedError);
    });

    it('can delete', (done) => {
      repositoryMock.setup((m) => m.delete(entity)).returns(Promise.resolve(true));

      entity.deleted = true;
      entity.delete(storagePath).then((deleted) => {
        expect(deleted).toBeTruthy();
        expect(unlinkMock.mock.calls[0][0]).toEqual(`${typePath}/${entity.storage}`);
        done();
      });
    });

    it('can prevent delete of file not marked for deletion', () => {
      entity.deleted = false;
      expect(() => {
        entity.delete(storagePath);
      }).toThrowError(InvalidOperationError);
    });

    it('can update scan result', (done) => {
      entity.updateScanResult(false).then((result) => {
        expect(result.scanned).toBeTruthy();
        expect(result.deleted).toBeFalsy();
        done();
      });
    });

    it('can update scan result as infected', (done) => {
      repositoryMock.setup((m) => m.save(entity)).returns(Promise.resolve(entity));

      entity.updateScanResult(true).then((result) => {
        expect(result.scanned).toBeTruthy();
        expect(result.deleted).toBeTruthy();
        done();
      });
    });
  });
});
