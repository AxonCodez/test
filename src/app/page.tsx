
"use client";

import Link from 'next/link';
import { getServices, serviceIcons, Service } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Bell, BookUser, Calendar, Home as HomeIcon, Search, User as UserIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Queue } from '@/context/QueueContext';
import { cn } from '@/lib/utils';

type QueueStatus = {
  [serviceId: string]: number;
};

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

export default function Home() {
  const { user } = useAuth();
  const allServices = useServices();
  const [activeTokens, setActiveTokens] = useState<{ serviceId: string; token: number }[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({});
  const [queueServices, setQueueServices] = useState<Service[]>([]);
  const [greeting, setGreeting] = useState({ text: 'GOOD MORNING', emoji: '☀️' });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ text: 'GOOD MORNING', emoji: '☀️' });
    } else if (hour < 18) {
      setGreeting({ text: 'GOOD AFTERNOON', emoji: '🌤️' });
    } else {
      setGreeting({ text: 'GOOD EVENING', emoji: '🌙' });
    }
  }, []);

  useEffect(() => {
    // Filter queue services based on user gender
    const allQueueServices = allServices.filter(s => s.type === 'queue');
    if (user?.gender === 'male') {
      setQueueServices(allQueueServices.filter(s => s.gender !== 'female'));
    } else if (user?.gender === 'female') {
      setQueueServices(allQueueServices.filter(s => s.gender !== 'male'));
    } else {
      // For 'other', 'prefer-not-to-say', or unset gender, show all non-gender-specific and both messes
      setQueueServices(allQueueServices);
    }
    
    const getQueueStatus = () => {
      const newQueueStatus: QueueStatus = {};
      const activeUserTokens: { serviceId: string; token: number }[] = [];

      allServices.forEach(service => {
        if (typeof window !== 'undefined' && service.type === 'queue') {
          const queueDataStr = localStorage.getItem(`queue_${service.id}`);
          const queue: Queue = queueDataStr ? JSON.parse(queueDataStr) : { currentToken: 0, totalTokens: 0, users: [] };
          
          newQueueStatus[service.id] = Math.max(0, queue.users.filter(u => u.token > queue.currentToken).length);

          if (user) {
            const userInQueue = queue.users.find(u => u.uid === user.uid);
            if (userInQueue) {
              activeUserTokens.push({ serviceId: service.id, token: userInQueue.token });
            }
          }
        }
      });

      setQueueStatus(newQueueStatus);
      setActiveTokens(activeUserTokens.slice(0, 1));
    };

    getQueueStatus();

    // Listen for storage changes to update UI in real-time
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('queue_') || event.key === 'demo_services') {
        getQueueStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, allServices]);

  const getQueueColorClass = (count: number | undefined): string => {
    if (count === undefined) return 'bg-secondary hover:bg-muted';
    if (count < 2) return 'bg-success/10 hover:bg-success/20 border-success/20'; // Green
    if (count <= 5) return 'bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/20'; // Yellow
    return 'bg-destructive/10 hover:bg-destructive/20 border-destructive/20'; // Red
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <Header />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="text-background">
          <p className="text-lg font-light flex items-center gap-2">
            <span className="text-yellow-400">{greeting.emoji}</span> {greeting.text}
          </p>
          <h1 className="text-3xl font-bold">{user?.displayName || 'Guest'}</h1>
        </div>

        {user && (!user.gender || !user.registrationNumber) && (
          <Alert className="bg-accent/90 border-accent-foreground/20 text-accent-foreground">
            <AlertTitle className="font-bold">Complete Your Profile</AlertTitle>
            <AlertDescription>
              <div className="flex justify-between items-center">
                <p>Please set your details to personalize your experience.</p>
                <Link href="/profile">
                  <Button variant="link" className="p-0 h-auto text-accent-foreground font-bold">
                    Go to Profile
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="bg-primary/80 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/80">FEATURED</p>
                <p className="font-medium mt-1">Meet your staff, proctor or HOD</p>
                <Link href="/search">
                   <Button variant="link" className="p-0 h-auto text-white/90 mt-2">Book an appointment</Button>
                </Link>
              </div>
              <BookUser className="w-16 h-16 text-white/30" />
            </CardContent>
          </Card>
          {activeTokens.map(tokenInfo => {
            const service = allServices.find(s => s.id === tokenInfo.serviceId);
            if (!service) return null;
            const Icon = serviceIcons[service.iconName];
            return (
               <Card key={tokenInfo.serviceId} className="bg-accent/80 backdrop-blur-sm border-pink-300/20 text-accent-foreground">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase opacity-80">Active Tokens</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 opacity-70" />
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    <div className="bg-white/20 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg">
                      #{tokenInfo.token}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-card text-card-foreground rounded-t-3xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Live Queues</h2>
              <Link href="/queues" className="text-sm font-semibold text-primary">See all queues</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {queueServices.map(service => {
                const queueLength = queueStatus[service.id];
                const cardColorClass = getQueueColorClass(queueLength);
                return (
                  <Link href={`/queue/${service.id}`} key={service.id}>
                    <Card className={cn("transition-colors", cardColorClass)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              In queue - {queueLength ?? 0} {queueLength === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>

       <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-2 m-4 rounded-full shadow-lg border w-[calc(100%-2rem)] mx-auto">
        <div className="flex justify-around items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-primary">
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
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-muted-foreground">
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
  );

    