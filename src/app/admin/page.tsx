
"use client";

import { getServices, Service } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// A custom hook to manage services with live updates from localStorage
const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const updateServices = () => setServices(getServices());
    updateServices(); // Initial fetch

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'demo_services') {
        updateServices();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return services;
};


export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const services = useServices();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

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

  const queueServices = services.filter(s => s.type === 'queue');
  const appointmentServices = services.filter(s => s.type === 'appointment');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline">Admin Portal</h1>
        <p className="text-muted-foreground mb-8">Manage campus services efficiently.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Card className="flex flex-col lg:col-span-1">
            <CardHeader>
              <CardTitle>Manage Queues</CardTitle>
              <CardDescription>Advance the serving token for queued services.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-3">
              {queueServices.map(service => (
                <Link key={service.id} href={`/admin/queue/${service.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{service.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="flex flex-col lg:col-span-1">
            <CardHeader>
              <CardTitle>View Appointments</CardTitle>
              <CardDescription>See the schedule of appointments for the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-3">
              {appointmentServices.map(service => (
                <Link key={service.id} href={`/admin/appointments/${service.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{service.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          
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

        </div>
      </main>
    </div>
  );
}
