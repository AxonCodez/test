import { staff, appointments as mockAppointments } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Header } from '@/components/layout/Header';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User } from 'lucide-react';

export default function AdminAppointmentPage({ params }: { params: { staffId: string } }) {
  const { staffId } = params;
  const staffMember = staff.find(s => s.id === staffId);

  if (!staffMember) {
    notFound();
  }

  // NOTE: This is a Server Component, so it cannot access localStorage
  // for appointments made by users in the current session. It only shows
  // statically defined mock appointments. A real application would fetch
  // this data from a database.
  const todaysAppointments = [...(mockAppointments[staffId] || [])].sort((a, b) => {
    // Basic time sorting for AM/PM
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
            <p className="text-muted-foreground text-lg">{staffMember.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booked Slots</CardTitle>
            <CardDescription>
              Showing all pre-scheduled appointments for today.
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
