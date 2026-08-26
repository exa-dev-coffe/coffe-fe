export interface UserItem {
  userId: number;
  email: string;
  fullName: string;
  photo: string | null;
  roleId: number;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserPayload {
  fullName: string;
  roleId: number;
  photo?: string | null;
}

export interface AdminResetPasswordPayload {
  newPassword: string;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  roleId?: number;
  searchValue?: string;
  searchKey?: string;
}

export interface PaginatedUsersResponse {
  data: UserItem[];
  totalData: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  lastPage: boolean;
}
