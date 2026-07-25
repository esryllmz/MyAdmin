import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Eye,
  History,
  Home,
  LayoutDashboard,
  Moon,
  PenSquare,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/core/components/ui/command";
import { useTheme } from "@/core/theme/ThemeContext";
import { useCurrentRole } from "@/core/hooks/useCurrentRole";
import { useInstantDemo, type DemoRole } from "@/features/landing/hooks/useInstantDemo";

const NAV_ITEMS: Array<{ label: string; path: string; icon: typeof Home; roles: DemoRole[] | null }> = [
  { label: "Landing Sayfası", path: "/", icon: Home, roles: null },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Editor", "Viewer"] },
  { label: "Kullanıcı Yönetimi", path: "/team", icon: Users, roles: ["Admin", "Editor"] },
  { label: "Roller ve Yetkiler", path: "/roles", icon: ShieldCheck, roles: ["Admin"] },
  { label: "Aktiviteler", path: "/activities", icon: History, roles: ["Admin", "Editor", "Viewer"] },
  { label: "Raporlar", path: "/reports", icon: BarChart3, roles: ["Admin", "Editor", "Viewer"] },
  { label: "Ayarlar", path: "/settings", icon: Settings, roles: ["Admin"] },
];

const ROLE_ITEMS: Array<{ role: DemoRole; icon: typeof Shield }> = [
  { role: "Admin", icon: Shield },
  { role: "Editor", icon: PenSquare },
  { role: "Viewer", icon: Eye },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const startInstantDemo = useInstantDemo();
  const role = useCurrentRole();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (role && item.roles.includes(role as DemoRole))
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Komut Paleti"
      description="Sayfalar arasında gezinin veya hızlı aksiyonlar çalıştırın"
    >
      <CommandInput placeholder="Bir sayfa veya aksiyon arayın..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

        <CommandGroup heading="Sayfalar">
          {visibleNavItems.map(({ label, path, icon: Icon }) => (
            <CommandItem key={path} value={label} onSelect={() => runCommand(() => navigate(path))}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Hızlı Aksiyonlar">
          <CommandItem value="tema-degistir" onSelect={() => runCommand(toggleTheme)}>
            {theme === "light" ? <Moon /> : <Sun />}
            {theme === "light" ? "Karanlık Moda Geç" : "Aydınlık Moda Geç"}
            <CommandShortcut>Tema</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Demo Rolü Değiştir">
          {ROLE_ITEMS.map(({ role, icon: Icon }) => (
            <CommandItem
              key={role}
              value={`${role} rolü demo`}
              onSelect={() => runCommand(() => startInstantDemo(role))}
            >
              <Icon />
              {role} olarak devam et
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
