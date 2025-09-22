
"use client";

import { deleteService, getServices, Service } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ArrowRight, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

// A custom hook to manage services with live updates from localStorage
const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);

  const updateServices = () => setServices(getServices());

  useEffect(() => {
    updateServices(); // Initial fetch

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'demo_services') {
        updateServices();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { services, updateServices };
};


export default function AdminPage() {
  const { user, isAdmin, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const { services, updateServices } = useServices();
  const { toast } = useToast();

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);
  
  const handleDeleteService = () => {
    if (!serviceToDelete) return;

    deleteService(serviceToDelete.id);
    
    toast({
      title: "Service Deleted",
      description: `Successfully deleted the "${serviceToDelete.name}" service.`,
    });

    // Trigger a storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', { key: 'demo_services' }));

    updateServices(); // Manually refresh services list in this component
    setServiceToDelete(null);
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  // Super admins see all services, other admins only see their assigned ones.
  const visibleServices = isSuperAdmin 
    ? services 
    : services.filter(s => s.assignedAdmin === user?.email);

  const queueServices = visibleServices.filter(s => s.type === 'queue');
  const appointmentServices = visibleServices.filter(s => s.type === 'appointment');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline">Admin Portal</h1>
        <p className="text-muted-foreground mb-8">Manage campus services efficiently.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          { (isSuperAdmin || queueServices.length > 0) && (
            <Card className="flex flex-col lg:col-span-1">
              <CardHeader>
                <CardTitle>Manage Queues</CardTitle>
                <CardDescription>View and manage your assigned queues.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-3">
                {queueServices.map(service => (
                  <div key={service.id} className="group p-4 rounded-lg border bg-background hover:bg-muted transition-all">
                    <Link href={`/admin/queue/${service.id}`} className="block">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{service.name}</h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                     <div className="flex items-center gap-2 mt-2 pt-2 border-t border-transparent group-hover:border-border">
                        <Link href={`/admin/edit-service/${service.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            <Edit className="mr-1 h-3 w-3"/> Edit
                          </Button>
                        </Link>
                        {isSuperAdmin && (
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => setServiceToDelete(service)}>
                            <Trash2 className="mr-1 h-3 w-3"/> Delete
                          </Button>
                        )}
                      </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}


          { (isSuperAdmin || appointmentServices.length > 0) && (
            <Card className="flex flex-col lg:col-span-1">
              <CardHeader>
                <CardTitle>View Appointments</CardTitle>
                <CardDescription>See schedules for your assigned services.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-3">
                {appointmentServices.map(service => (
                  <div key={service.id} className="group p-4 rounded-lg border bg-background hover:bg-muted transition-all">
                    <Link href={`/admin/appointments/${service.id}`} className="block">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{service.name}</h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-transparent group-hover:border-border">
                      <Link href={`/admin/edit-service/${service.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          <Edit className="mr-1 h-3 w-3"/> Edit
                        </Button>
                      </Link>
                      {isSuperAdmin && (
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => setServiceToDelete(service)}>
                          <Trash2 className="mr-1 h-3 w-3"/> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          { isSuperAdmin && (
            <Card className="flex flex-col lg:col-span-1 border-dashed hover:border-solid hover:border-primary transition-all">
              <Link href="/admin/create-service" className="h-full">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
                  <PlusCircle className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Create New Service</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a new queue or appointment-based service.
                  </p>
                </CardContent>
              </Link>
            </Card>
          )}

        </div>
      </main>

       <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{serviceToDelete?.name}</strong> service and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
