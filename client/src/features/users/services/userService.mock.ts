import { getMockRoles, mockAdminRole, mockEditorRole, mockViewerRole } from "@/features/roles/services/roleService.mock";
import type { UserResponseDto } from "../types/userTypes";
import type { RegisterUserRequest } from "@/features/auth/types/authTypes";

/**
 * Modül seviyesinde mutable liste — demo modunda davet/sil/durum/rol değişikliği
 * oturum boyunca kalıcı olsun diye (aksi halde her invalidateQueries sonrası
 * mock veri sıfırlanıp değişiklik geri alınmış gibi görünürdü).
 */
let mockUsers: UserResponseDto[] = [
  {
    id: "mock-user-01",
    username: "esra.yilmaz",
    email: "esra.yilmaz@myadmin.demo",
    profileImageUrl: null,
    bio: "Platform & ürün sorumlusu.",
    isActive: true,
    createdDate: "2026-01-14T09:12:00.000Z",
    updatedDate: null,
    roles: [mockAdminRole],
  },
  {
    id: "mock-user-02",
    username: "deniz.kaya",
    email: "deniz.kaya@myadmin.demo",
    profileImageUrl: null,
    bio: "İçerik operasyonları.",
    isActive: true,
    createdDate: "2026-02-02T11:30:00.000Z",
    updatedDate: null,
    roles: [mockEditorRole],
  },
  {
    id: "mock-user-03",
    username: "mert.aydin",
    email: "mert.aydin@myadmin.demo",
    profileImageUrl: null,
    bio: null,
    isActive: true,
    createdDate: "2026-02-18T08:05:00.000Z",
    updatedDate: null,
    roles: [mockEditorRole],
  },
  {
    id: "mock-user-04",
    username: "zeynep.demir",
    email: "zeynep.demir@myadmin.demo",
    profileImageUrl: null,
    bio: "Müşteri destek ekibi.",
    isActive: false,
    createdDate: "2026-03-01T14:45:00.000Z",
    updatedDate: "2026-05-20T10:00:00.000Z",
    roles: [mockViewerRole],
  },
  {
    id: "mock-user-05",
    username: "can.ozturk",
    email: "can.ozturk@myadmin.demo",
    profileImageUrl: null,
    bio: "Kıdemli sistem yöneticisi.",
    isActive: true,
    createdDate: "2026-03-09T16:20:00.000Z",
    updatedDate: null,
    roles: [mockAdminRole],
  },
  {
    id: "mock-user-06",
    username: "elif.sahin",
    email: "elif.sahin@myadmin.demo",
    profileImageUrl: null,
    bio: null,
    isActive: true,
    createdDate: "2026-03-22T09:40:00.000Z",
    updatedDate: null,
    roles: [mockViewerRole],
  },
  {
    id: "mock-user-07",
    username: "burak.celik",
    email: "burak.celik@myadmin.demo",
    profileImageUrl: null,
    bio: "İçerik editörü, yayın takvimi sorumlusu.",
    isActive: true,
    createdDate: "2026-04-05T13:15:00.000Z",
    updatedDate: null,
    roles: [mockEditorRole],
  },
  {
    id: "mock-user-08",
    username: "gizem.arslan",
    email: "gizem.arslan@myadmin.demo",
    profileImageUrl: null,
    bio: "Sadece raporlama erişimi.",
    isActive: false,
    createdDate: "2026-04-11T10:50:00.000Z",
    updatedDate: "2026-06-01T09:00:00.000Z",
    roles: [mockViewerRole],
  },
  {
    id: "mock-user-09",
    username: "kaan.yildiz",
    email: "kaan.yildiz@myadmin.demo",
    profileImageUrl: null,
    bio: null,
    isActive: true,
    createdDate: "2026-05-02T15:00:00.000Z",
    updatedDate: null,
    roles: [mockAdminRole],
  },
  {
    id: "mock-user-10",
    username: "aylin.polat",
    email: "aylin.polat@myadmin.demo",
    profileImageUrl: null,
    bio: "Yeni ekip üyesi.",
    isActive: true,
    createdDate: "2026-06-18T12:00:00.000Z",
    updatedDate: null,
    roles: [mockViewerRole],
  },
];

export const getMockUsers = (): UserResponseDto[] => mockUsers.map((user) => ({ ...user }));

export const addMockUser = (request: RegisterUserRequest): UserResponseDto => {
  const now = new Date().toISOString();
  const newUser: UserResponseDto = {
    id: `mock-user-${crypto.randomUUID().slice(0, 8)}`,
    username: request.username,
    email: request.email,
    profileImageUrl: null,
    bio: null,
    isActive: true,
    createdDate: now,
    updatedDate: null,
    roles: [mockViewerRole],
  };

  mockUsers = [newUser, ...mockUsers];
  return newUser;
};

export const deleteMockUser = (id: string): void => {
  mockUsers = mockUsers.filter((user) => user.id !== id);
};

export const updateMockUserStatus = (id: string, isActive: boolean): void => {
  const now = new Date().toISOString();
  mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, isActive, updatedDate: now } : user));
};

export const syncMockUserRole = (userId: string, roleId: string): void => {
  const role = getMockRoles().find((candidate) => candidate.id === roleId);
  if (!role) return;

  const now = new Date().toISOString();
  mockUsers = mockUsers.map((user) => (user.id === userId ? { ...user, roles: [role], updatedDate: now } : user));
};
