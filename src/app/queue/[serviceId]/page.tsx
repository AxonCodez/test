
"use client";

import { useState, useEffect, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getServices, Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, Users, Timer, LogOut } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, UserData } from '@/context/AuthContext';
import type { Queue, QueueUser } from '@/context/QueueContext';

export default function QueuePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const { user, loading: authLoading } = useAuth();
  
  const [service, setService] = useState<Service | undefined | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [userInQueue, setUserInQueue] = useState<QueueUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const notificationSentRef = useRef(false);

  // Function to get the latest queue data from localStorage
  const getQueueData = () => {
    const queueDataStr = localStorage.getItem(`queue_${serviceId}`);
    return queueDataStr ? JSON.parse(queueDataStr) : { currentToken: 0, totalTokens: 0, users: [] };
  };

  useEffect(() => {
    if (!serviceId || authLoading) return;

    setService(getServices().find(s => s.id === serviceId));

    const updateState = () => {
      const currentQueue = getQueueData();
      setQueue(currentQueue);
      if (user) {
        const foundUser = currentQueue.users.find((u: QueueUser) => u.uid === user.uid) || null;
        setUserInQueue(foundUser);
        if (foundUser) {
          notificationSentRef.current = false;
        }
      } else {
        setUserInQueue(null);
      }
      setIsLoading(false);
    };

    updateState();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `queue_${serviceId}` || event.key === 'demo_services') {
        setService(getServices().find(s => s.id === serviceId));
        updateState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [serviceId, user, authLoading]);

  const isMyTurn = userInQueue && queue && userInQueue.token <= queue.currentToken;

  useEffect(() => {
    if (isMyTurn && !notificationSentRef.current) {
      const permission = localStorage.getItem('notification_permission');
      if (permission === 'granted' && service) {
        new Notification("It's your turn!", {
          body: `Your token #${userInQueue?.token} for ${service.name} is now being served.`,
          icon: '/favicon.ico',
        });
        notificationSentRef.current = true;
      }
    }
  }, [isMyTurn, userInQueue, service]);


  const handleGetToken = () => {
    if (!user || !queue) return;
    
    const currentQueue = getQueueData();
    const newUserToken = currentQueue.totalTokens + 1;
    
    const newUserInQueue: QueueUser = {
      uid: user.uid,
      name: user.displayName || 'Anonymous',
      token: newUserToken,
    };
    
    currentQueue.totalTokens = newUserToken;
    currentQueue.users.push(newUserInQueue);
    
    localStorage.setItem(`queue_${serviceId}`, JSON.stringify(currentQueue));
    setQueue(currentQueue);
    setUserInQueue(newUserInQueue);
    notificationSentRef.current = false;
  };
  
  const handleLeaveQueue = () => {
    if (!user || !userInQueue) return;

    const currentQueue = getQueueData();
    currentQueue.users = currentQueue.users.filter((u: QueueUser) => u.uid !== user.uid);
    
    localStorage.setItem(`queue_${serviceId}`, JSON.stringify(currentQueue));
    setQueue(currentQueue);
    setUserInQueue(null);
  };

  if (!isLoading && !service) {
    notFound();
  }

  const peopleAhead = userInQueue && queue ? userInQueue.token - queue.currentToken - 1 : 0;
  const estimatedWaitTime = peopleAhead > 0 ? peopleAhead * 2 : 0; // Assuming 2 mins per person
  const totalInQueue = queue ? queue.users.filter(u => u.token > (queue?.currentToken || 0)).length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            {service ? (
              <>
                <CardTitle className="text-2xl font-headline">{service.name}</CardTitle>
                <CardDescription>Digital Queue System</CardDescription>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto mt-2" />
              </>
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Now Serving</p>
                {isLoading ? <Skeleton className="h-10 w-20 mx-auto mt-1" /> : <p className="text-4xl font-bold text-primary">{`#${queue?.currentToken ?? 0}`}</p>}
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total in Queue</p>
                 {isLoading ? <Skeleton className="h-10 w-20 mx-auto mt-1" /> : <p className="text-4xl font-bold">{totalInQueue}</p>}
              </div>
            </div>

            {userInQueue ? (
              <div className="text-center p-6 border rounded-lg w-full bg-primary/5 flex flex-col items-center gap-4">
                <div>
                  <p className="text-lg font-medium text-primary">Your Token</p>
                  <p className="text-6xl font-extrabold text-primary my-2">#{userInQueue.token}</p>
                </div>
                {isMyTurn ? (
                  <p className="text-success font-semibold text-lg animate-pulse">It's your turn!</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead of you</span>
                    </div>
                    {peopleAhead > 0 && (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        <span>Estimated wait: ~{estimatedWaitTime} minutes</span>
                      </div>
                    )}
                  </div>
                )}
                <Button onClick={handleLeaveQueue} variant="outline" className="w-full mt-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Queue
                </Button>
              </div>
            ) : (
              <Button onClick={handleGetToken} size="lg" className="w-full" disabled={isLoading || authLoading || !user || service?.status === 'Closed'}>
                <Ticket className="mr-2 h-5 w-5" /> {user ? 'Get a Token' : 'Login to Get Token'}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
