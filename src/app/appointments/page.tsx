
"use client";

import { useState, useEffect } from 'react';
import { getServices, Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowRight, UserCheck, CalendarDays, Clock, Home as HomeIcon, Search, Calendar, BarChart3, User as UserIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
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

type UserAppointment = {
  serviceId: string;
  serviceName: string;
  time: string;
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myAppointments, setMyAppointments] = useState<UserAppointment[]>([]);
  const [appointmentToCancel, setAppointmentToCancel] = useState<UserAppointment | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const getAllAppointments = () => {
    if (!user) return;
    const userAppointments: UserAppointment[] = [];
    const allServices = getServices();
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('appointments_')) {
        const serviceId = key.replace('appointments_', '');
        const service = allServices.find(s => s.id === serviceId);
        if (service) {
          const bookings: {time: string, studentId: string}[] = JSON.parse(localStorage.getItem(key) || '[]');
          const userBookings = bookings.filter(b => b.studentId === (user.registrationNumber || user.displayName || user.uid));
          
          userBookings.forEach(booking => {
            userAppointments.push({
              serviceId: service.id,
              serviceName: service.name,
              time: booking.time,
            });
          });
        }
      }
    });

    userAppointments.sort((a, b) => {
      const aTime = new Date(`1/1/2000 ${a.time}`);
      const bTime = new Date(`1/1/2000 ${b.time}`);
      return aTime.getTime() - bTime.getTime();
    });

    setMyAppointments(userAppointments);
  };

  useEffect(() => {
    setIsClient(true);
    getAllAppointments();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('appointments_')) {
        getAllAppointments();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleCancelAppointment = () => {
    if (!appointmentToCancel || !user) return;

    const { serviceId, time } = appointmentToCancel;
    const storageKey = `appointments_${serviceId}`;
    const bookings: {time: string, studentId: string}[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const updatedBookings = bookings.filter(b => 
      !(b.time === time && b.studentId === (user.registrationNumber || user.displayName || user.uid))
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedBookings));

    toast({
      title: "Appointment Cancelled",
      description: `Your appointment for ${appointmentToCancel.serviceName} at ${time} has been cancelled.`,
    });

    setAppointmentToCancel(null);
    getAllAppointments(); // Refresh the list
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline">My Appointments</h1>
          <p className="text-muted-foreground mb-8">All your scheduled appointments for today.</p>

          {isClient && myAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAppointments.map((apt, index) => (
                <Card key={`${apt.serviceId}-${apt.time}-${index}`} className="flex flex-col">
                  <CardHeader>
                     <CardTitle>{apt.serviceName}</CardTitle>
                     <CardDescription>Your appointment is scheduled.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-center items-center gap-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-6 w-6" />
                      <p className="text-3xl font-bold">{apt.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/> Today</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setAppointmentToCancel(apt)}>
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Cancel Appointment
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">You Have No Appointments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book an appointment from the search page to see it here.
              </p>
              <Link href="/search" passHref>
                  <Button className="mt-6">
                      <ArrowRight className="mr-2 h-4 w-4" /> Go to Search
                  </Button>
              </Link>
            </div>
          )}
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
            <Link href="/appointments">
              <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-primary">
                <Calendar className="w-6 h-6" />
                 <span className="text-xs">Appointments</span>
              </Button>
            </Link>
            <Link href="/queues">
              <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs">Queues</span>
              </Button>
            </Link>
            <Link href="/profile">
             <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
              <UserIcon className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Button>
            </Link>
          </div>
        </footer>
      </div>

      <AlertDialog open={!!appointmentToCancel} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel your appointment for <strong>{appointmentToCancel?.serviceName}</strong> at <strong>{appointmentToCancel?.time}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
