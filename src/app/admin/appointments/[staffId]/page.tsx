
"use client";
import { getServices, appointments as mockAppointments } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Header } from '@/components/layout/Header';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminAppointmentPage({ params }: { params: { staffId: string } }) {
  const { staffId } = params;
  const [isClient, setIsClient] = useState(false);
  const service = getServices().find(s => s.id === staffId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!service) {
    notFound();
  }

  // NOTE: This component now also considers appointments made by users in the current session
  // from localStorage, in addition to statically defined mock appointments.
  const getAppointments = () => {
    if (typeof window === 'undefined') {
      return [...(mockAppointments[staffId] || [])];
    }
    const storedBookings: {time: string, studentId: string}[] = JSON.parse(localStorage.getItem(`appointments_${staffId}`) || '[]');
    const userBookedAppointments = storedBookings.map(b => ({ time: b.time, student: b.studentId }));
    
    // Combine mock and localStorage appointments, removing duplicates
    const allApts = [...(mockAppointments[staffId] || []), ...userBookedAppointments];
    const uniqueApts = Array.from(new Set(allApts.map(a => a.time)))
      .map(time => allApts.find(a => a.time === time)!);

    return uniqueApts;
  };
  
  const todaysAppointments = (isClient ? getAppointments() : [...(mockAppointments[staffId] || [])]).sort((a, b) => {
    const aTime = new Date(`1/1/2000 ${a.time}`);
    const bTime = new Date(`1/1/2000 ${b.time}`);
    return aTime.getTime() - bTime.getTime();
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-headline">Today's Appointments</h1>
            <p className="text-muted-foreground text-lg">{service.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booked Slots</CardTitle>
            <CardDescription>
              Showing all scheduled appointments for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Time</TableHead>
                    <TableHead>Booked By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysAppointments.map(apt => (
                    <TableRow key={apt.time}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground"/> 
                          <span>{apt.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground"/> 
                          <span>{apt.student}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="font-semibold">No appointments scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
