import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../types/database.ts';
import { dbService } from '../services/db.ts';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isCompleted: boolean;
  totalSecondsRemaining: number;
}

interface EventContextType {
  events: Event[];
  activeEvent: Event | null;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  activeSummary: ReturnType<typeof dbService.getEventSummary> | null;
  globalStats: ReturnType<typeof dbService.getGlobalDashboardStats>;
  createEvent: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  calculateCountdown: (event: Event | null) => CountdownTime;
  refreshData: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEventId, setActiveEventIdState] = useState<string>('');
  const [activeSummary, setActiveSummary] = useState<ReturnType<typeof dbService.getEventSummary> | null>(null);
  const [globalStats, setGlobalStats] = useState<ReturnType<typeof dbService.getGlobalDashboardStats>>(dbService.getGlobalDashboardStats());

  const refreshData = () => {
    const allEvents = dbService.getEvents();
    setEvents(allEvents);
    const activeId = dbService.getActiveEventId() || allEvents[0]?.id || '';
    setActiveEventIdState(activeId);
    if (activeId) {
      setActiveSummary(dbService.getEventSummary(activeId));
    } else {
      setActiveSummary(null);
    }
    setGlobalStats(dbService.getGlobalDashboardStats());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = dbService.subscribe(refreshData);
    return () => {
      unsubscribe();
    };
  }, []);

  const setActiveEventId = (id: string) => {
    dbService.setActiveEventId(id);
    setActiveEventIdState(id);
    setActiveSummary(dbService.getEventSummary(id));
  };

  const createEvent = (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = dbService.createEvent(data);
    refreshData();
    return created;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    dbService.updateEvent(id, updates);
    refreshData();
  };

  const deleteEvent = (id: string) => {
    dbService.deleteEvent(id);
    refreshData();
  };

  const calculateCountdown = (event: Event | null): CountdownTime => {
    if (!event) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: false, isCompleted: false, totalSecondsRemaining: 0 };
    }

    const startDateTime = new Date(`${event.eventDate}T${event.startTime || '00:00'}`).getTime();
    const endDateTime = new Date(`${event.eventDate}T${event.endTime || '23:59'}`).getTime();
    const now = Date.now();

    if (now > endDateTime || event.status === 'completed') {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isCompleted: true, totalSecondsRemaining: 0 };
    }

    const diff = startDateTime - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isCompleted: false, totalSecondsRemaining: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      isStarted: false,
      isCompleted: false,
      totalSecondsRemaining: totalSeconds,
    };
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        activeSummary,
        globalStats,
        createEvent,
        updateEvent,
        deleteEvent,
        calculateCountdown,
        refreshData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within an EventProvider');
  return context;
};
