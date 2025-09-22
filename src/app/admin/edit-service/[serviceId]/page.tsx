
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getServices, updateService, serviceIcons, Service, timeSlots as defaultTimeSlots } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, X, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const { user, isSuperAdmin, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'queue' | 'appointment' | ''>('');
  const [iconName, setIconName] = useState<keyof typeof serviceIcons | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'all'>('all');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (authLoading) return;

    const existingService = getServices().find(s => s.id === serviceId);
    if (existingService) {
        if (!isSuperAdmin && existingService.assignedAdmin !== user?.email) {
            router.push('/admin/login');
            return;
        }

      setService(existingService);
      setName(existingService.name);
      setDescription(existingService.description);
      setType(existingService.type);
      setIconName(existingService.iconName);
      setGender(existingService.gender || 'all');
      setAssignedAdmin(existingService.assignedAdmin || '');
      setTimeSlots(existingService.timeSlots || defaultTimeSlots);
    } else {
      notFound();
    }
  }, [serviceId, authLoading, isSuperAdmin, user, router]);

  if (!service) {
    return <div>Loading...</div>; // Or a proper loading state
  }
  
  const iconEntries = Object.entries(serviceIcons);

  const handleAddSlot = () => {
    const formattedTime = newTimeSlot.trim().toUpperCase();
    if (formattedTime && !timeSlots.includes(formattedTime)) {
        const tempDate = new Date(`1970-01-01T${formattedTime}`);
        if (!isNaN(tempDate.getTime())) {
             const timeString = tempDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
             setTimeSlots(prev => [...prev, timeString].sort());
             setNewTimeSlot('');
        } else if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(formattedTime)) {
             setTimeSlots(prev => [...prev, formattedTime].sort());
             setNewTimeSlot('');
        } else {
            toast({ variant: "destructive", title: "Invalid Time Format", description: "Please use HH:MM AM/PM." });
        }
    }
  };

  const handleRemoveSlot = (slot: string) => {
    setTimeSlots(prev => prev.filter(s => s !== slot));
  };


  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !type || !iconName || !assignedAdmin) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields, including assigned admin.",
      });
      return;
    }
    
    setLoading(true);

    const updatedServiceData: Service = {
      ...service,
      id: service.id,
      name,
      description,
      type,
      iconName,
      gender: type === 'queue' ? gender : 'all',
      assignedAdmin,
      timeSlots: type === 'appointment' ? timeSlots : undefined,
      status: service.status, 
    };
    
    updateService(updatedServiceData);
    
    toast({
      title: "Service Updated",
      description: `Successfully updated the "${name}" service.`,
    });

    window.dispatchEvent(new StorageEvent('storage', {
        key: 'demo_services',
        newValue: 'updated',
    }));

    router.push('/admin');
  };

  const readOnlyForNonSuperAdmin = !isSuperAdmin;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Edit Service</CardTitle>
            <CardDescription>Update the details for "{service.name}".</CardDescription>
          </CardHeader>
          <CardContent>
            {readOnlyForNonSuperAdmin && (
                 <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>As a service manager, you can only edit certain fields like time slots.</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleUpdateService} className="flex flex-col gap-4">
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  disabled={readOnlyForNonSuperAdmin}
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                  disabled={readOnlyForNonSuperAdmin}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="type">Service Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)} required disabled={readOnlyForNonSuperAdmin}>
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
                    <Select value={iconName} onValueChange={(v) => setIconName(v as any)} required disabled={readOnlyForNonSuperAdmin}>
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
              
              <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="assignedAdmin">Assigned Manager Email</Label>
                  <Input 
                  id="assignedAdmin" 
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  required 
                  disabled={readOnlyForNonSuperAdmin}
                  />
              </div>
              
              {type === 'queue' && (
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="gender">Gender Specific (for Queues)</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as any)} required disabled={readOnlyForNonSuperAdmin}>
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

              {type === 'appointment' && (
                <div className="grid w-full items-center gap-2 rounded-lg border p-4">
                  <Label>Manage Time Slots</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., 04:30 PM"
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSlot())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddSlot}>Add</Button>
                  </div>
                  {timeSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {timeSlots.map(slot => (
                        <Badge key={slot} variant="secondary" className="flex items-center gap-1">
                          {slot}
                          <button type="button" onClick={() => handleRemoveSlot(slot)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center pt-2">No time slots added.</p>
                  )}
                </div>
              )}

              <Button className="w-full mt-4" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
