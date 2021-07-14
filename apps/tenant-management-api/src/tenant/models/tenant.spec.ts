import { TenantEntity } from './tenant';
import { v4 as uuidv4 } from 'uuid';
import { TenantRepository } from '../repository';
import { Mock } from 'moq.ts';

describe('TenantEntity', () => {
  it('can be created', () => {
    const id = uuidv4();
    const repositoryMock = new Mock<TenantRepository>();
    const entity = new TenantEntity(
      repositoryMock.object(),
      id,
      'mock-realm',
      'mock@gov.ab.ca',
      'https://access-dev/mock',
      'mock_user'
    );
    expect(entity).toBeTruthy();
    expect(entity.id).toBeTruthy();
    expect(entity.realm).toBeTruthy();
    expect(entity.adminEmail).toBeTruthy();
  });

  it('can save the tenant', () => {
    const repositoryMock = new Mock<TenantRepository>();
    const id = uuidv4();
    const entity = new TenantEntity(
      repositoryMock.object(),
      id,
      'mock-realm',
      'mock@gov.ab.ca',
      'https://access-dev/mock',
      'mock_user'
    );

    repositoryMock.setup((instance) => instance.save(It.IsAny())).returns(Promise.resolve(entity));
    entity.save();
    repositoryMock.verify((instance) => instance.save(entity));
  });

  it('returns a tenant object', () => {
    const repositoryMock = new Mock<TenantRepository>();
    const id = uuidv4();
    const entity = new TenantEntity(
      repositoryMock.object(),
      id,
      'mock-realm',
      'mock@gov.ab.ca',
      'https://access-dev/mock',
      'mock_user'
    );

    const obj = entity.obj();
    expect(obj.id).toBe(id);
  });
});
