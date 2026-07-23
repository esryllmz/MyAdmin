import { useSelector } from "react-redux";
import type { RootState } from "@/core/store/store";

export const useIsAdmin = (): boolean => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return currentUser?.roles?.some((role) => role.name === "Admin") ?? false;
};
