
"use client";

import { Bell, ChevronLeft, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './Logo';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '';
    const name = user?.displayName || email;
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const handleNotificationClick = () => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      toast({
        variant: 'destructive',
        title: 'Notifications Not Supported',
        description: 'This browser does not support desktop notifications.',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      toast({
        title: 'Notifications Already Enabled',
        description: 'We will notify you when it is your turn.',
      });
      new Notification('Q-Less Notifications', { body: "You're all set to receive alerts!" });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          localStorage.setItem('notification_permission', 'granted');
          toast({
            title: 'Notifications Enabled!',
            description: 'You will now be notified when your turn is up.',
          });
          new Notification('Q-Less Notifications', { body: "Great! We'll keep you updated." });
        } else {
          localStorage.setItem('notification_permission', 'denied');
          toast({
            variant: 'destructive',
            title: 'Notifications Disabled',
            description: 'You will not receive alerts. You can enable them in browser settings.',
          });
        }
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Notifications Blocked',
        description: 'Please enable notifications in your browser settings to receive alerts.',
      });
    }
  };

  const isTransparentBg = pathname === '/';
  const textColorClass = isTransparentBg ? 'text-background' : 'text-foreground';

  return (
    <header className={isTransparentBg ? 'bg-transparent' : 'bg-background'}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {pathname !== '/' ? (
            <Button onClick={() => router.back()} variant="ghost" size="icon" className={`h-10 w-10 rounded-full ${textColorClass}`}>
              <ChevronLeft />
              <span className="sr-only">Back</span>
            </Button>
          ) : <Logo className={cn("h-8 w-auto", textColorClass)} />}
          {pathname !== '/' && <Logo className={cn("h-8 w-auto", textColorClass)} />}
        </div>
        <nav className="flex items-center gap-2">
          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link href="/login" className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', isTransparentBg ? 'bg-white/20 border-white/50 text-white hover:bg-white/30' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground', 'h-10 px-4 py-2')}>
                Login
            </Link>
          )}
           <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-full ${textColorClass}`} onClick={handleNotificationClick}>
            <Bell />
          </Button>
        </nav>
      </div>
    </header>
  );
}
