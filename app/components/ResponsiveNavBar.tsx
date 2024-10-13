import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { Command, Menu, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Theme, useTheme } from "remix-themes";

import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export default function ResponsiveNavBar() {
  const [theme, setTheme] = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setMounted] = useState(false); // To check if the component has mounted

  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true); // Now the component is mounted
  }, []);

  const toggleTheme = () => {
    setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const navBrand = t("title");

  const navItems = [
    { title: t("playlists"), to: "/playlists" },
    { title: t("artists"), to: "/artists" },
    { title: t("songs"), to: "/songs" },
    { title: t("online_search"), to: "/online" },
    { title: t("settings"), to: "/settings" },
    { title: t("login"), to: "/login" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="hidden md:flex">
          <Link to="/" className="mr-4 flex items-center space-x-2">
            <Command className="size-5" />
            <span className="font-bold">{navBrand}</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink asChild>
                    <Link to={item.to}>
                      <div className={navigationMenuTriggerStyle()}>
                        {item.title}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle />
              <SheetDescription />
            </SheetHeader>
            <Link to="/">
              <span className="font-bold">{navBrand}</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navItems.map((item, index) => (
                  <Link key={index} to={item.to}>
                    <h4 className="font-semibold">{item.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="ml-auto">
              {isMounted &&
                (theme === "dark" ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                ))}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
