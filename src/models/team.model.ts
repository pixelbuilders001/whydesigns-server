import { BaseModel } from './base.model';

export interface ITeam extends BaseModel {
  _id: string; // UUID - Primary Key
  name: string;
  designation: string;
  description?: string;
  image?: string;
  isPublished: boolean;
  publishedAt: string | null; // ISO 8601 timestamp
  displayOrder: number;
}

// Team creation input (without auto-generated fields)
export interface CreateTeamInput {
  name: string;
  designation: string;
  description?: string;
  image?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

// Team update input
export interface UpdateTeamInput {
  name?: string;
  designation?: string;
  description?: string;
  image?: string;
  isPublished?: boolean;
  publishedAt?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

// Team response interface
export interface TeamResponse extends ITeam {}

// Utility class for team operations
export class TeamUtils {
  // Publish team member
  static publishTeam(team: ITeam): ITeam {
    return {
      ...team,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
  }

  // Unpublish team member
  static unpublishTeam(team: ITeam): ITeam {
    return {
      ...team,
      isPublished: false,
    };
  }

  // Update display order
  static updateDisplayOrder(team: ITeam, order: number): ITeam {
    return {
      ...team,
      displayOrder: order,
    };
  }
}

export default ITeam;
