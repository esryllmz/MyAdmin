import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";

export const useCurrentRole = (): string | null => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return currentUser?.roles?.[0]?.name ?? null;
};
