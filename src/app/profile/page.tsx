
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home as HomeIcon, LogOut, Plus, Search, User as UserIcon, Save, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gender, setGender] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setRegistrationNumber(user.registrationNumber || '');
      setGender(user.gender || '');
    }
  }, [user, loading, router]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    const success = await updateUser({ 
      displayName, 
      registrationNumber, 
      gender 
    });
    
    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
    }
    setIsSaving(false);
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '';
    const name = user?.displayName || email;
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20 border-4 border-primary/50">
            <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
            <AvatarFallback className="text-2xl">{getInitials(user.email)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold font-headline">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your profile and settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="displayName">Full Name</Label>
                <Input 
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input 
                  id="registrationNumber"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g., 25BCEXXXX"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSaving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button onClick={logout} variant="destructive" className="w-full mt-8">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>

      </main>
       <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-2 m-4 rounded-full shadow-lg border w-[calc(100%-2rem)] mx-auto">
        <div className="flex justify-around items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
              <Search className="w-6 h-6" />
              <span className="text-xs">Search</span>
            </Button>
          </Link>
          <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-6">
            <Plus className="w-8 h-8" />
          </Button>
          <Link href="/queues">
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs">Queues</span>
            </Button>
          </Link>
          <Link href="/profile">
           <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-primary">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
