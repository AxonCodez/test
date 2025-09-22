
"use client";

import { useState, useEffect } from 'react';
import { getServices, serviceIcons, Service } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { Ticket, ArrowRight, UserCheck, Home as HomeIcon, Search, Plus, BarChart3, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Queue, QueueUser } from '@/context/QueueContext';

type UserToken = {
  serviceId: string;
  serviceName: string;
  iconName: keyof typeof serviceIcons;
  token: number;
  currentToken: number;
  totalInQueue: number;
};

export default function QueuesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [activeTokens, setActiveTokens] = useState<UserToken[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setServices(getServices());
  }, []);


  useEffect(() => {
    setIsClient(true);
    if (!user) return;

    const getActiveTokens = () => {
      const userTokens: UserToken[] = [];
      services.forEach(service => {
        if (service.type === 'queue') {
          const queueDataStr = localStorage.getItem(`queue_${service.id}`);
          if (queueDataStr) {
            const queue: Queue = JSON.parse(queueDataStr);
            const userInQueue = queue.users.find((u: QueueUser) => u.uid === user.uid);
            if (userInQueue) {
              userTokens.push({
                serviceId: service.id,
                serviceName: service.name,
                iconName: service.iconName,
                token: userInQueue.token,
                currentToken: queue.currentToken,
                totalInQueue: queue.users.filter(u => u.token > queue.currentToken).length,
              });
            }
          }
        }
      });
      setActiveTokens(userTokens);
    };

    getActiveTokens();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('queue_') || event.key === 'demo_services') {
        setServices(getServices()); // Reread services in case they changed
        getActiveTokens();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, services]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline">Your Active Queues</h1>
        <p className="text-muted-foreground mb-8">Here are all the queues you're currently in.</p>

        {isClient && activeTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTokens.map(tokenInfo => {
               const Icon = serviceIcons[tokenInfo.iconName];
              return (
              <Card key={tokenInfo.serviceId} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                     </div>
                     <CardTitle className="m-0">{tokenInfo.serviceName}</CardTitle>
                  </div>
                   <CardDescription>You have token #{tokenInfo.token}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between gap-4">
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">#{tokenInfo.currentToken}</p>
                      <p className="text-xs text-muted-foreground">Now Serving</p>
                    </div>
                     <div>
                      <p className="text-2xl font-bold">{tokenInfo.totalInQueue}</p>
                      <p className="text-xs text-muted-foreground">In Queue</p>
                    </div>
                  </div>
                  <Link href={`/queue/${tokenInfo.serviceId}`} passHref>
                    <Button className="w-full">
                        View Details <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )})}
          </div>
        ) : (
          <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">You're Not in Any Queues</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Join a queue from the home page to see your status here.
            </p>
            <Link href="/" passHref>
                <Button className="mt-6">
                    <ArrowRight className="mr-2 h-4 w-4" /> Go to Home
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
          <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-6">
            <Plus className="w-8 h-8" />
          </Button>
          <Link href="/queues">
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-primary">
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
  );
}
