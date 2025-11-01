import { BaseModel } from './base.model';
import { ActivityType } from './leadActivity.model';

export interface ILead extends BaseModel {
  id: string; // UUID - Primary Key
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

/**
 * User info for contactedBy field
 */
export interface LeadContactedByUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Latest activity info for lead
 */
export interface LeadLatestActivity {
  id: string;
  activityType: ActivityType;
  activityDate: string;
  remarks?: string;
  nextFollowUpDate?: string;
  counselorId: string;
  counselorName: string;
}

/**
 * Lead response interface with populated data
 */
export interface LeadResponse extends Omit<ILead, 'contactedBy'> {
  contactedBy?: LeadContactedByUser;
  latestActivity?: LeadLatestActivity;
  totalActivities: number;
}

export default ILead;
