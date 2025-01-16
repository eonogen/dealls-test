import BaseModel from './BaseModel.js';

export default class AutoTimestampModel extends BaseModel {
  createdAt: string | undefined;
  updatedAt: string | undefined;

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
