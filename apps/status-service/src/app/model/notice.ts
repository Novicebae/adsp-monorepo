import { UnauthorizedError, NewOrExisting, Update } from '@core-services/core-common';
import { InvalidParamsError } from '../common/errors';
import { NoticeRepository } from '../repository/notice';
import { NoticeApplication, NoticeModeType, isValidNoticeModeType, ServiceUserRoles } from '../types';
import type { User } from '@abgov/adsp-service-sdk';
import { application } from 'express';

export class NoticeApplicationEntity {
  id: string;
  message: string;
  tennantServRef: string;
  startDate: Date;
  endDate: Date;
  mode: NoticeModeType;

  constructor(private repository: NoticeRepository, application: NewOrExisting<NoticeApplication>) {
    this.id = application?.id;
    this.message = application.message;
    this.tennantServRef = application.tennantServRef;
    this.startDate = application.startDate;
    this.endDate = application.endDate;
    this.mode = application.mode;
  }

  static create(
    user: User,
    repository: NoticeRepository,
    application: NewOrExisting<NoticeApplication>
  ): Promise<NoticeApplicationEntity> {
    const entity = new NoticeApplicationEntity(repository, application);

    if (!entity.canCreate(user)) {
      throw new UnauthorizedError('User not authorized to create service status.');
    }

    return repository.save(entity);
  }

  update(user: User, update: Update<NoticeApplication>): Promise<NoticeApplicationEntity> {
    if (!this.canUpdate(user)) {
      throw new UnauthorizedError('User not authorized to update service status.');
    }

    if (update.mode && !isValidNoticeModeType(update.mode)) {
      throw new InvalidParamsError('Input notice mode is not allowed.');
    }

    if (this.mode != 'draft') {
      if (this.mode == 'archived') {
        throw new InvalidParamsError('Archived notice cannot be updated.');
      }

      this.mode = update.mode ?? this.mode;
    } else {
      this.message = update.message ?? this.message;
      this.tennantServRef = update.tennantServRef ?? this.tennantServRef;
      this.startDate = update.startDate ?? this.startDate;
      this.endDate = update.endDate ?? this.endDate;

      if (update.mode != 'active') {
        throw new InvalidParamsError('Draft notice can only be changed to active.');
      }

      this.mode = update.mode ?? this.mode;
    }

    return this.repository.save(this);
  }

  private canUpdate(user: User): boolean {
    return user && user.roles && user.roles.includes(ServiceUserRoles.StatusAdmin);
  }

  delete(user: User): Promise<boolean> {
    if (!this.canDelete(user) || this.mode != 'draft') {
      throw new UnauthorizedError('User not authorized to delete notice.');
    }

    return this.repository.delete(this);
  }

  private canDelete(user: User): boolean {
    return user && user.roles && user.roles.includes(ServiceUserRoles.StatusAdmin);
  }

  private canCreate(user: User): boolean {
    return user && user.roles && user.roles.includes(ServiceUserRoles.StatusAdmin);
  }

  canAccess(user: User): boolean {
    return user && user.roles && user.roles.includes(ServiceUserRoles.StatusAdmin);
  }

  canAccessById(user: User, application: NewOrExisting<NoticeApplication>): boolean {
    if (application.mode == 'active') {
      return true;
    }

    return user && user.roles && user.roles.includes(ServiceUserRoles.StatusAdmin);
  }
}
