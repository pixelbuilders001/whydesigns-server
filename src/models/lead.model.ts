import { BaseModel } from './base.model';

export interface ILead extends BaseModel {
  _id: string; // UUID - Primary Key
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  message?: string;
  contacted: boolean;
  contactedAt?: string; // ISO 8601 timestamp
  contactedBy?: string; // User ID
}

export interface CreateLeadInput {
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  message?: string;
}

export interface UpdateLeadInput {
  fullName?: string;
  email?: string;
  phone?: string;
  areaOfInterest?: string;
  message?: string;
  contacted?: boolean;
  contactedAt?: string;
  contactedBy?: string;
  isActive?: boolean;
}

export default ILead;
