
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addService, serviceIcons, Service, timeSlots as defaultTimeSlots } from '@/lib/data';
import type { Icon as LucideIcon } from 'lucide-react';

export default function CreateServicePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'queue' | 'appointment' | ''>('');
  const [iconName, setIconName] = useState<keyof typeof serviceIcons | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'all'>('all');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const iconEntries = Object.entries(serviceIcons);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !type || !iconName || (type && !assignedAdmin)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields, including assigned admin.",
      });
      return;
    }
    
    setLoading(true);

    const newService: Service = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      type,
      iconName,
      gender,
      assignedAdmin,
      timeSlots: type === 'appointment' ? [...defaultTimeSlots] : undefined,
      status: 'Open', // Default to open
    };
    
    addService(newService);
    
    toast({
      title: "Service Created",
      description: `Successfully created the "${name}" service.`,
    });

    // Trigger a storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'demo_services',
        newValue: 'updated', // content doesn't matter, just the event
    }));

    router.push('/admin');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create a New Service</CardTitle>
            <CardDescription>Add a new queue or appointment service to the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateService} className="flex flex-col gap-4">
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Library Helpdesk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="e.g., Get help with library services."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="type">Service Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="queue">Queue</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="icon">Icon</Label>
                    <Select value={iconName} onValueChange={(v) => setIconName(v as any)} required>
                    <SelectTrigger id="icon">
                        <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                        {iconEntries.map(([name, IconComponent]) => (
                        <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{name}</span>
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
              </div>

               {type && (
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="assignedAdmin">Assigned Manager Email</Label>
                    <Input 
                      id="assignedAdmin" 
                      placeholder="e.g., manager@example.com"
                      value={assignedAdmin}
                      onChange={(e) => setAssignedAdmin(e.target.value)}
                      required 
                    />
                </div>
              )}
              
                {type === 'queue' && (
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="gender">Gender Specific (for Queues)</Label>
                        <Select value={gender} onValueChange={(v) => setGender(v as any)} required>
                            <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="male">Male Only</SelectItem>
                            <SelectItem value="female">Female Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

              <Button className="w-full mt-4" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Service'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    
