import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "@/features/auth/store/authSlice";
import { logActivity } from "@/features/activities/store/activityFeedSlice";
import type { UserResponseDto } from "@/features/users/types/userTypes";

export type DemoRole = "Admin" | "Editor" | "Viewer";

const DEMO_ROLE_PRESETS: Record<DemoRole, { label: string; description: string }> = {
  Admin: { label: "Administrator", description: "Tüm sistem üzerinde tam yetki." },
  Editor: { label: "Editör", description: "İçerik yönetimi ve kullanıcı görüntüleme yetkisi." },
  Viewer: { label: "Gözlemci", description: "Sadece görüntüleme yetkisi olan kısıtlı rol." },
};

export const useInstantDemo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (role: DemoRole = "Admin") => {
    const now = new Date().toISOString();
    const preset = DEMO_ROLE_PRESETS[role];
    const roleSlug = role.toLowerCase();

    const demoUser: UserResponseDto = {
      id: `guest-${roleSlug}-demo`,
      username: `Guest ${role}`,
      email: `guest.${roleSlug}@myadmin.demo`,
      profileImageUrl: null,
      bio: "Instant demo session",
      isActive: true,
      createdDate: now,
      updatedDate: null,
      roles: [
        {
          id: `demo-${roleSlug}-role`,
          name: role,
          label: preset.label,
          description: preset.description,
          createdDate: now,
          updatedDate: null,
          permissions: [],
        },
      ],
    };

    localStorage.setItem("demoMode", "true");
    localStorage.setItem("accessToken", `demo.${roleSlug}.access-token`);
    localStorage.setItem("refreshToken", `demo.${roleSlug}.refresh-token`);
    dispatch(setCredentials(demoUser));
    dispatch(
      logActivity({
        type: "demo-role-switch",
        actor: "Ziyaretçi",
        message: `${role} rolüyle anlık demo oturumu başlattı`,
        isSuccess: true,
      })
    );
    navigate("/dashboard");
  };
};
