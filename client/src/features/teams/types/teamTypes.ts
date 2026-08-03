export const TEAM_MEMBERSHIP_ROLES = ['Member', 'Manager', 'Owner'] as const;
export type TeamMembershipRole = (typeof TEAM_MEMBERSHIP_ROLES)[number];

export interface TeamResponseDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  createdByUserId: string;
  createdByUsername: string | null;
  memberCount: number;
  managerCount: number;
}

export interface CreatedTeamResponseDto {
  id: string;
  name: string;
}

export interface TeamMemberResponseDto {
  id: string;
  teamId: string;
  userId: string;
  username: string;
  email: string;
  profileImageUrl: string | null;
  applicationRole: string | null;
  membershipRole: TeamMembershipRole;
  isActive: boolean;
  joinedDate: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string | null;
}

export interface UpdateTeamRequest {
  name: string;
  description?: string | null;
}

export interface AddTeamMemberRequest {
  userId: string;
  membershipRole: TeamMembershipRole;
}

export interface UpdateTeamMemberRequest {
  membershipRole: TeamMembershipRole;
}

export interface TeamListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
}
