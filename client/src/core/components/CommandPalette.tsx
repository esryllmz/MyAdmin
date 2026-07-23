import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  History,
  Home,
  LayoutDashboard,
  Moon,
  PenSquare,
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
import { useInstantDemo, type DemoRole } from "@/features/landing/hooks/useInstantDemo";

const NAV_ITEMS = [
  { label: "Landing Sayfası", path: "/", icon: Home },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Kullanıcı Yönetimi", path: "/team", icon: Users },
  { label: "Roller ve Yetkiler", path: "/roles", icon: ShieldCheck },
  { label: "Aktiviteler", path: "/activities", icon: History },
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
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
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
