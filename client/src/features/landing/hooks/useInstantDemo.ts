import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "@/features/auth/store/authSlice";
import type { UserResponseDto } from "@/features/users/types/userTypes";

export const useInstantDemo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return () => {
    const now = new Date().toISOString();
    const demoUser: UserResponseDto = {
      id: "guest-admin-demo",
      username: "Guest Admin",
      email: "guest@myadmin.demo",
      profileImageUrl: null,
      bio: "Instant demo session",
      isActive: true,
      createdDate: now,
      updatedDate: null,
      roles: [
        {
          id: "demo-admin-role",
          name: "Admin",
          label: "Administrator",
          description: "Demo administrator role",
          createdDate: now,
          updatedDate: null,
          permissions: [],
        },
      ],
    };

    localStorage.setItem("demoMode", "true");
    localStorage.setItem("accessToken", "demo.guest.access-token");
    localStorage.setItem("refreshToken", "demo.guest.refresh-token");
    dispatch(setCredentials(demoUser));
    navigate("/dashboard");
  };
};
