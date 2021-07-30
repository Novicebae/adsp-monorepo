import * as path from 'path';
import { IsNotEmpty, IsDefined } from 'class-validator';
import type { User } from '@abgov/adsp-service-sdk';
import { UnauthorizedError, Update } from '@core-services/core-common';
import { FileType, ServiceUserRoles } from '../types';
import { Logger } from 'winston';

/**
 * Represents a type of file with specific access and update policy.
 *
 * Note that this entity is a child of the Space aggregate and hence not associated with
 * its own repository.
 * @export
 * @class FileTypeEntity
 * @implements {FileType}
 */
export class FileTypeEntity implements FileType {
  id: string;
  logger?: Logger;
  @IsNotEmpty()
  name: string;
  anonymousRead = false;
  @IsDefined()
  readRoles: string[] = [];
  @IsDefined()
  updateRoles: string[] = [];
  spaceId?: string;

  static create(
    id: string,
    name: string,
    anonymousRead: boolean,
    readRoles: string[],
    updateRoles: string[],
    spaceId: string
  ): FileTypeEntity {
    const newType: FileType = {
      id,
      name,
      anonymousRead,
      readRoles,
      updateRoles,
      spaceId,
    };
    return new FileTypeEntity(newType);
  }

  constructor(type: FileType) {
    this.id = type.id;
    this.name = type.name;
    this.anonymousRead = type.anonymousRead;
    this.readRoles = type.readRoles || [];
    this.updateRoles = type.updateRoles || [];
    this.spaceId = type.spaceId;
  }

  canAccessFile(user: User): boolean {
    return this.anonymousRead || (user && user.roles && !!user.roles.find((role) => this.readRoles.includes(role)));
  }

  canUpdateFile(user: User): boolean {
    return user && user.roles && !!user.roles.find((role) => this.updateRoles.includes(role));
  }

  update(user: User, update: Update<FileType>): void {
    if (!this.canUpdate(user)) {
      throw new UnauthorizedError('User not authorized to update type.');
    }

    if (update.name) {
      this.name = update.name;
    }

    if (update.anonymousRead !== undefined) {
      this.anonymousRead = update.anonymousRead;
    }

    if (update.readRoles) {
      this.readRoles = update.readRoles;
    }

    if (update.updateRoles) {
      this.updateRoles = update.updateRoles;
    }
  }

  canUpdate(user: User): boolean | string {
    console.log(JSON.stringify(user.roles) + '<role');
    console.log(JSON.stringify(this.updateRoles) + '<>this.updateRoles');

    return (
      (user && user.roles && user.roles.includes(ServiceUserRoles.Admin)) ||
      user.roles.find((role) => this.updateRoles.includes(role))
    );
  }

  getPath(storageRoot: string): string {
    return path.join(storageRoot, this.spaceId, this.id);
  }

  canAccess(user: User): boolean {
    return this.canAccessFile(user);
  }
}
