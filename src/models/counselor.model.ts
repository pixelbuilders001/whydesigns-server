import { BaseModel } from './base.model';

export interface ICounselor extends BaseModel {
  _id: string; // UUID - Primary Key
  fullName: string;
  email: string;
  title: string;
  yearsOfExperience: number;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  rating: number;
}

export interface CreateCounselorInput {
  fullName: string;
  email: string;
  title: string;
  yearsOfExperience: number;
  bio: string;
  avatarUrl?: string;
  specialties: string[];
}

export interface UpdateCounselorInput {
  fullName?: string;
  title?: string;
  yearsOfExperience?: number;
  bio?: string;
  avatarUrl?: string;
  specialties?: string[];
  rating?: number;
  isActive?: boolean;
}

// Utility class
export class CounselorUtils {
  static getExperienceLevel(yearsOfExperience: number): string {
    if (yearsOfExperience < 2) return 'Junior';
    if (yearsOfExperience < 5) return 'Mid-Level';
    if (yearsOfExperience < 10) return 'Senior';
    return 'Expert';
  }
}

export default ICounselor;
