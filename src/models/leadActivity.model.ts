import { BaseModel } from './base.model';

export type ActivityType =
  | 'contacted'
  | 'follow_up'
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'interested'
  | 'not_interested'
  | 'converted'
  | 'closed'
  | 'other';

export interface ILeadActivity extends BaseModel {
  id: string; // UUID - Primary Key (was activityId)
  leadId: string; // Lead ID reference
  counselorId: string; // Counselor/User ID reference
  activityType: ActivityType;
  remarks?: string;
  activityDate: string; // ISO 8601 timestamp
  nextFollowUpDate?: string; // ISO 8601 timestamp (optional)
  followupDate?: string; // ISO 8601 timestamp (optional)
}

// Lead Activity creation input (without auto-generated fields)
export interface CreateLeadActivityInput {
  leadId: string;
  counselorId: string;
  activityType: ActivityType;
  remarks?: string;
  activityDate?: string;
  nextFollowUpDate?: string;
  followupDate?: string;
}

// Lead Activity update input
export interface UpdateLeadActivityInput {
  activityType?: ActivityType;
  remarks?: string;
  activityDate?: string;
  nextFollowUpDate?: string;
  followupDate?: string;
  isActive?: boolean;
}

// Counselor info in response
export interface CounselorInfo {
  id: string;
  name: string;
  email: string;
}

// Lead Activity response interface
export interface LeadActivityResponse extends Omit<ILeadActivity, 'counselorId'> {
  counselor: CounselorInfo;
  formattedActivityDate: string;
  formattedNextFollowUpDate?: string;
  formattedFollowupDate?: string;
}

// Utility class for lead activity operations
export class LeadActivityUtils {
  // Activity type labels
  static readonly ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
    contacted: 'Contacted',
    follow_up: 'Follow Up',
    meeting_scheduled: 'Meeting Scheduled',
    meeting_completed: 'Meeting Completed',
    interested: 'Interested',
    not_interested: 'Not Interested',
    converted: 'Converted',
    closed: 'Closed',
    other: 'Other',
  };

  // Get activity type label
  static getActivityTypeLabel(activityType: ActivityType): string {
    return this.ACTIVITY_TYPE_LABELS[activityType] || activityType;
  }

  // Format date to human readable format (YYYY-MM-DD HH:MM:SS)
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Check if next follow-up is overdue
  static isFollowUpOverdue(activity: ILeadActivity): boolean {
    if (!activity.nextFollowUpDate) return false;
    return new Date(activity.nextFollowUpDate) < new Date();
  }

  // Check if follow-up is due soon (within 3 days)
  static isFollowUpDueSoon(activity: ILeadActivity): boolean {
    if (!activity.nextFollowUpDate) return false;

    const nextFollowUpDate = new Date(activity.nextFollowUpDate);
    const now = new Date();
    const daysUntilFollowUp = (nextFollowUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilFollowUp <= 3 && daysUntilFollowUp >= 0;
  }

  // Get days until next follow-up
  static getDaysUntilFollowUp(activity: ILeadActivity): number | null {
    if (!activity.nextFollowUpDate) return null;

    const nextFollowUpDate = new Date(activity.nextFollowUpDate);
    const now = new Date();
    const daysDifference = Math.ceil((nextFollowUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysDifference;
  }

  // Convert to response with formatted fields
  // Note: This method cannot populate counselor data - use the service layer for that
  static toResponse(activity: ILeadActivity, counselor: CounselorInfo): LeadActivityResponse {
    const { counselorId, ...activityWithoutCounselorId } = activity;
    return {
      ...activityWithoutCounselorId,
      counselor,
      formattedActivityDate: this.formatDate(activity.activityDate),
      formattedNextFollowUpDate: activity.nextFollowUpDate
        ? this.formatDate(activity.nextFollowUpDate)
        : undefined,
      formattedFollowupDate: activity.followupDate
        ? this.formatDate(activity.followupDate)
        : undefined,
    };
  }
}

export default ILeadActivity;
