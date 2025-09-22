
"use client";

import { useState, useEffect } from 'react';
import { getServices, serviceIcons, Service } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowRight, BarChart3, Home as HomeIcon, Plus, Search as SearchIcon, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const [services, setServices] = useState<Service[]>([]);
  
  useEffect(() => {
    setServices(getServices());
  }, []);

  const appointmentServices = services.filter(service => service.type === 'appointment');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline">Search Services</h1>
        <p className="text-muted-foreground mb-8">Find and book appointments.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointmentServices.map(service => {
            const Icon = serviceIcons[service.iconName];
            return (
              <Link href={`/appointment/${service.id}`} key={service.id}>
                <Card className="bg-secondary hover:bg-muted transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
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
            <Button variant="ghost" size="icon" className="flex-col h-16 w-16 gap-1 text-primary">
              <SearchIcon className="w-6 h-6" />
              <span className="text-xs">Search</span>
            </Button>
          </Link>
          <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-6">
            <Plus className="w-8 h-8" />
          </Button>
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
}
