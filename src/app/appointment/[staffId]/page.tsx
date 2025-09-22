
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { staff, timeSlots as allTimeSlots, appointments as mockAppointments } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
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
import { useAuth } from '@/context/AuthContext';

type Appointment = { time: string; studentId: string };

export default function AppointmentPage() {
  const params = useParams();
  const staffId = params.staffId as string;
  const staffMember = staff.find(s => s.id === staffId);
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ time: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, fetch booked slots from an API.
    // For demo, we use localStorage to persist bookings for the session.
    const storedBookings: Appointment[] = JSON.parse(localStorage.getItem(`appointments_${staffId}`) || '[]');
    const preBooked = mockAppointments[staffId]?.map(a => a.time) || [];
    setBookedSlots([...preBooked, ...storedBookings.map(b => b.time)]);
  }, [staffId]);
  
  const handleSelectSlot = (time: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedSlot(time);
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot || !user) return;

    const newBooking: Appointment = { time: selectedSlot, studentId: user.uid };
    const storedBookings: Appointment[] = JSON.parse(localStorage.getItem(`appointments_${staffId}`) || '[]');
    localStorage.setItem(`appointments_${staffId}`, JSON.stringify([...storedBookings, newBooking]));
    
    setBookedSlots(prev => [...prev, selectedSlot]);
    setConfirmedBooking({ time: selectedSlot });
    setShowConfirmDialog(false);
    setSelectedSlot(null);
  };
  
  if (!staffMember) {
    notFound();
  }

  if (confirmedBooking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center shadow-lg animate-in fade-in zoom-in-95">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground font-headline">Appointment Confirmed!</h2>
              <p className="text-muted-foreground mt-2">You are scheduled to meet with</p>
              <p className="font-semibold text-lg text-primary">{staffMember.name}</p>
              <div className="mt-6 bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-primary text-xl">{confirmedBooking.time}</span>
                </div>
              </div>
              <Button onClick={() => setConfirmedBooking(null)} className="mt-8 w-full">
                Book Another Slot
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 flex justify-center">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Book an Appointment</CardTitle>
              <CardDescription>with {staffMember.name} ({staffMember.title})</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold text-center mb-6">Available Time Slots for Today</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allTimeSlots.map((time) => {
                  const isBooked = isClient && bookedSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={isBooked ? 'secondary' : 'outline'}
                      className={cn("h-12", isBooked && "line-through text-muted-foreground cursor-not-allowed")}
                      disabled={!isClient || isBooked}
                      onClick={() => !isBooked && handleSelectSlot(time)}
                      aria-label={isBooked ? `Slot ${time} is booked` : `Book slot at ${time}`}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to book an appointment with {staffMember.name} at {selectedSlot} today?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
