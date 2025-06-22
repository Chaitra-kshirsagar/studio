"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Menu, LogOut, UserCircle, Settings, LogIn, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "./ui/skeleton";

const NavLinks = ({ className, closeSheet }: { className?: string; closeSheet?: () => void }) => {
  const { user } = useAuth();
  
  const handleLinkClick = () => {
    if (closeSheet) {
      closeSheet();
    }
  }

  return (
    <nav className={className}>
      <Link href="/" className="text-foreground/80 hover:text-foreground" onClick={handleLinkClick}>
        Events
      </Link>
      {user && (
        <>
          <Link href="/profile" className="text-foreground/80 hover:text-foreground" onClick={handleLinkClick}>
            My Profile
          </Link>
          {(user.role === 'event_admin' || user.role === 'super_admin') && (
            <Link href="/admin" className="text-foreground/80 hover:text-foreground" onClick={handleLinkClick}>
              Admin
            </Link>
          )}
        </>
      )}
    </nav>
  );
};

export default function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, loading, logout } = useAuth();

  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Flame className="h-6 w-6 text-primary" />
            <span className="font-headline">Bhumi Connect</span>
          </Link>
          <div className="flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : !user ? (
              <Button asChild variant="secondary" size="sm">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            ) : (
               <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex h-full flex-col gap-6 pt-8">
                     <div className="px-4 text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                           <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                           <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                     </div>
                    <NavLinks className="flex flex-col gap-4 text-lg px-4" closeSheet={() => setSheetOpen(false)} />
                    <div className="px-4 mt-auto pb-4">
                      <Button variant="outline" className="w-full" onClick={() => { logout(); setSheetOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
             )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Flame className="h-6 w-6 text-primary" />
          <span className="font-headline">Bhumi Connect</span>
        </Link>
        <NavLinks className="ml-10 hidden md:flex items-center gap-6 text-sm font-medium" />

        <div className="ml-auto">
          {loading ? (
             <Skeleton className="h-9 w-24 rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                     <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                     <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                 {(user.role === 'event_admin' || user.role === 'super_admin') && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin
                        </Link>
                    </DropdownMenuItem>
                 )}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                 Login / Sign Up
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
