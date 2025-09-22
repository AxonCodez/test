
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getServices, Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ticket, UserX, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import type { Queue, QueueUser } from '@/context/QueueContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

export default function AdminQueuePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const [service, setService] = useState<Service | undefined | null>(null);
  const { toast } = useToast();

  const [queue, setQueue] = useState<Queue | null>(null);

  // Function to get the latest queue data from localStorage
  const getQueueData = () => {
    const queueDataStr = localStorage.getItem(`queue_${serviceId}`);
    return queueDataStr ? JSON.parse(queueDataStr) : { currentToken: 0, totalTokens: 0, users: [] };
  };

  useEffect(() => {
    const updateState = () => {
      setService(getServices().find(s => s.id === serviceId));
      setQueue(getQueueData());
    };
    updateState();
    
    // Listen for storage changes from other tabs (the user page)
    const handleStorageChange = (event: StorageEvent) => {
       if (event.key === `queue_${serviceId}` || event.key === 'demo_services') {
        updateState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [serviceId]);

  const handleServeNext = () => {
    const currentQueue = getQueueData();
    if (currentQueue.currentToken < currentQueue.totalTokens) {
      currentQueue.currentToken += 1;
      localStorage.setItem(`queue_${serviceId}`, JSON.stringify(currentQueue));
      setQueue(currentQueue);
    }
  };
  
  const handleRemoveUser = (uid: string) => {
    const currentQueue = getQueueData();
    const userToRemove = currentQueue.users.find((u: QueueUser) => u.uid === uid);
    if (userToRemove) {
      currentQueue.users = currentQueue.users.filter((u: QueueUser) => u.uid !== uid);
      localStorage.setItem(`queue_${serviceId}`, JSON.stringify(currentQueue));
      setQueue(currentQueue);
      toast({
        title: "User Removed",
        description: `${userToRemove.name} (Token #${userToRemove.token}) has been removed from the queue.`
      });
    }
  };

  if (!service) {
    if (service === null) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
            <p>Loading...</p>
          </main>
        </div>
      );
    }
    notFound();
  }

  const activeUsers = queue?.users.filter(u => u.token > (queue?.currentToken || 0)).sort((a, b) => a.token - b.token) || [];
  const upcomingTokens = activeUsers.slice(0, 5).map(u => u.token);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1 shadow-xl sticky top-24">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Manage Queue</CardTitle>
              <CardDescription>{service.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="text-center p-6 border rounded-lg w-full bg-muted">
                <p className="text-lg font-medium text-muted-foreground">Currently Serving</p>
                <p className="text-8xl font-extrabold text-primary my-2">#{queue?.currentToken || 0}</p>
              </div>
              
              <Button onClick={handleServeNext} size="lg" className="w-full h-16 text-xl" disabled={(queue?.currentToken || 0) >= (queue?.totalTokens || 0)}>
                Serve Next Token <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              
              <div className="w-full pt-4 border-t">
                <h3 className="text-center font-semibold mb-3">Upcoming Tokens</h3>
                {upcomingTokens.length > 0 ? (
                  <div className="flex justify-center gap-2 flex-wrap">
                    {upcomingTokens.map(token => (
                      <div key={token} className="flex items-center gap-2 p-2 px-3 border rounded-full bg-background">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-semibold">#{token}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Queue is empty.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-xl">
             <CardHeader>
              <CardTitle>Users in Queue</CardTitle>
              <CardDescription>
                Showing {activeUsers.length} user(s) waiting.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {activeUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Token</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map(user => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-bold text-primary">#{user.token}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveUser(user.uid)}
                            aria-label={`Remove ${user.name} from queue`}
                          >
                            <UserX className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="font-semibold mt-4">The queue is currently empty.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
