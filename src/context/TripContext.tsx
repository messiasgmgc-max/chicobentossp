import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Trip,
  Place,
  ItineraryDay,
  ItineraryItem,
  TripNote,
  TripExpense,
  PlaceVote,
  PlaceStatus,
  PlaceCategory,
  TransitMode
} from '../types';
import {
  INITIAL_TRIP,
  INITIAL_PLACES,
  INITIAL_ITINERARY_DAYS,
  INITIAL_NOTES,
  INITIAL_EXPENSES
} from '../lib/mockData';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

interface TripContextType {
  trip: Trip;
  places: Place[];
  itineraryDays: ItineraryDay[];
  notes: TripNote[];
  expenses: TripExpense[];
  currentUser: string;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  
  // Trip management
  setCurrentUser: (user: string) => void;
  updateTrip: (tripData: Partial<Trip>) => void;
  addParticipant: (name: string) => void;

  // Places
  addPlace: (place: Omit<Place, 'id' | 'createdAt' | 'votes'>) => Place;
  updatePlace: (id: string, placeData: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  votePlace: (placeId: string, voteType: 'up' | 'down' | 'super_want', comment?: string) => void;
  changePlaceStatus: (placeId: string, status: PlaceStatus) => void;

  // Itinerary
  addDay: (title: string, date: string, description?: string) => void;
  updateDay: (dayId: string, data: Partial<ItineraryDay>) => void;
  deleteDay: (dayId: string) => void;
  addItemToDay: (dayId: string, placeId: string, notes?: string, transitTips?: string) => void;
  removeItemFromDay: (dayId: string, itemId: string) => void;
  reorderDayItems: (dayId: string, sourceIndex: number, destIndex: number) => void;
  updateItineraryItem: (dayId: string, itemId: string, data: Partial<ItineraryItem>) => void;
  
  // Notes & Expenses
  addNote: (note: Omit<TripNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, noteData: Partial<TripNote>) => void;
  deleteNote: (id: string) => void;
  toggleChecklistNote: (id: string) => void;
  
  addExpense: (expense: Omit<TripExpense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;

  // Sync & Utils
  syncWithSupabase: () => Promise<void>;
  resetToDefaultSPData: () => void;
  triggerCelebration: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'sampatrip_v1_';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state initialization with localStorage fallback
  const [trip, setTrip] = useState<Trip>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}trip`);
    return saved ? JSON.parse(saved) : INITIAL_TRIP;
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}places`);
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}days`);
    return saved ? JSON.parse(saved) : INITIAL_ITINERARY_DAYS;
  });

  const [notes, setNotes] = useState<TripNote[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}notes`);
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [expenses, setExpenses] = useState<TripExpense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}current_user`) || 'Lucas';
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { isConfigured: isSupabaseConnected } = getSupabaseConfig();

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}trip`, JSON.stringify(trip));
  }, [trip]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}places`, JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}days`, JSON.stringify(itineraryDays));
  }, [itineraryDays]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}current_user`, currentUser);
  }, [currentUser]);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // Ignore if confetti fails
    }
  }, []);

  // Supabase sync implementation
  const syncWithSupabase = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSyncing(true);
    try {
      // 1. Try to fetch remote trip
      const { data: remoteTrips, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .limit(1);

      if (!tripErr && remoteTrips && remoteTrips.length > 0) {
        const rTrip = remoteTrips[0];
        setTrip(prev => ({
          ...prev,
          id: rTrip.id,
          title: rTrip.title,
          description: rTrip.description || prev.description,
          startDate: rTrip.start_date || prev.startDate,
          endDate: rTrip.end_date || prev.endDate,
          coverImage: rTrip.cover_image || prev.coverImage,
        }));
      }

      // 2. Fetch remote places
      const { data: remotePlaces, error: placesErr } = await supabase
        .from('places')
        .select('*, place_votes(*)');

      if (!placesErr && remotePlaces && remotePlaces.length > 0) {
        const mappedPlaces: Place[] = remotePlaces.map((rp: any) => ({
          id: rp.id,
          tripId: rp.trip_id,
          name: rp.name,
          category: rp.category as PlaceCategory,
          neighborhood: rp.neighborhood,
          address: rp.address,
          lat: rp.lat,
          lng: rp.lng,
          description: rp.description || '',
          priceLevel: rp.price_level || 2,
          rating: rp.rating || 4.5,
          estimatedTimeMins: rp.estimated_time_mins || 90,
          photoUrl: rp.photo_url || '',
          tags: rp.tags || [],
          metroStation: rp.metro_station,
          metroLine: rp.metro_line,
          status: rp.status || 'wishlist',
          createdBy: rp.created_by || 'Viajante',
          createdAt: rp.created_at,
          votes: (rp.place_votes || []).map((v: any) => ({
            id: v.id,
            placeId: v.place_id,
            userName: v.user_name,
            voteType: v.vote_type,
            comment: v.comment,
            createdAt: v.created_at,
          })),
        }));
        setPlaces(mappedPlaces);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.warn('Erro na sincronização com o Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Trip Actions
  const updateTrip = (tripData: Partial<Trip>) => {
    setTrip(prev => ({ ...prev, ...tripData }));
  };

  const addParticipant = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trip.participants.includes(trimmed)) return;
    setTrip(prev => ({
      ...prev,
      participants: [...prev.participants, trimmed],
    }));
  };

  // Place Actions
  const addPlace = (placeData: Omit<Place, 'id' | 'createdAt' | 'votes'>): Place => {
    const newPlace: Place = {
      ...placeData,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      votes: [
        {
          id: `v-${Date.now()}`,
          placeId: '',
          userName: currentUser,
          voteType: 'super_want',
          comment: 'Sugestão adicionada por mim!',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    newPlace.votes![0].placeId = newPlace.id;

    setPlaces(prev => [newPlace, ...prev]);
    triggerCelebration();

    // Async push to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('places').insert({
        name: newPlace.name,
        category: newPlace.category,
        neighborhood: newPlace.neighborhood,
        address: newPlace.address,
        lat: newPlace.lat,
        lng: newPlace.lng,
        description: newPlace.description,
        price_level: newPlace.priceLevel,
        rating: newPlace.rating,
        estimated_time_mins: newPlace.estimatedTimeMins,
        photo_url: newPlace.photoUrl,
        tags: newPlace.tags,
        metro_station: newPlace.metroStation,
        metro_line: newPlace.metroLine,
        status: newPlace.status,
        created_by: newPlace.createdBy,
      }).then();
    }

    return newPlace;
  };

  const updatePlace = (id: string, placeData: Partial<Place>) => {
    setPlaces(prev => prev.map(p => (p.id === id ? { ...p, ...placeData } : p)));
  };

  const deletePlace = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
    // Also remove from any itinerary day
    setItineraryDays(prev =>
      prev.map(day => ({
        ...day,
        items: day.items.filter(item => item.placeId !== id),
      }))
    );
  };

  const votePlace = (placeId: string, voteType: 'up' | 'down' | 'super_want', comment?: string) => {
    setPlaces(prev =>
      prev.map(p => {
        if (p.id !== placeId) return p;
        const currentVotes = p.votes || [];
        const existingVoteIndex = currentVotes.findIndex(v => v.userName === currentUser);

        let updatedVotes: PlaceVote[];
        if (existingVoteIndex >= 0) {
          // Update existing vote
          updatedVotes = [...currentVotes];
          updatedVotes[existingVoteIndex] = {
            ...updatedVotes[existingVoteIndex],
            voteType,
            comment: comment !== undefined ? comment : updatedVotes[existingVoteIndex].comment,
          };
        } else {
          // Add new vote
          updatedVotes = [
            ...currentVotes,
            {
              id: `v-${Date.now()}`,
              placeId,
              userName: currentUser,
              voteType,
              comment,
              createdAt: new Date().toISOString(),
            },
          ];
        }

        return { ...p, votes: updatedVotes };
      })
    );
  };

  const changePlaceStatus = (placeId: string, status: PlaceStatus) => {
    setPlaces(prev =>
      prev.map(p => (p.id === placeId ? { ...p, status } : p))
    );
    if (status === 'visited') {
      triggerCelebration();
    }
  };

  // Itinerary Actions
  const addDay = (title: string, date: string, description?: string) => {
    const newDay: ItineraryDay = {
      id: `day-${Date.now()}`,
      dayNumber: itineraryDays.length + 1,
      title,
      date,
      description,
      items: [],
    };
    setItineraryDays(prev => [...prev, newDay]);
  };

  const updateDay = (dayId: string, data: Partial<ItineraryDay>) => {
    setItineraryDays(prev =>
      prev.map(d => (d.id === dayId ? { ...d, ...data } : d))
    );
  };

  const deleteDay = (dayId: string) => {
    setItineraryDays(prev =>
      prev
        .filter(d => d.id !== dayId)
        .map((d, index) => ({ ...d, dayNumber: index + 1 }))
    );
  };

  const addItemToDay = (dayId: string, placeId: string, notes?: string, transitTips?: string) => {
    const targetPlace = places.find(p => p.id === placeId);
    if (!targetPlace) return;

    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;

        // Check if already in day
        if (day.items.some(item => item.placeId === placeId)) {
          return day;
        }

        const prevItem = day.items[day.items.length - 1];
        let defaultTransit: TransitMode = 'metro';
        let defaultTransitDuration = 15;
        let tips = transitTips;

        if (prevItem && prevItem.placeId) {
          const prevPlace = places.find(p => p.id === prevItem.placeId);
          if (prevPlace && prevPlace.neighborhood === targetPlace.neighborhood) {
            defaultTransit = 'walk';
            defaultTransitDuration = 8;
            tips = `Caminhada rápida em ${targetPlace.neighborhood}`;
          }
        }

        const newItem: ItineraryItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          dayId,
          placeId,
          place: targetPlace,
          orderIndex: day.items.length,
          startTime: day.items.length === 0 ? '10:00' : undefined,
          notes: notes || `Visitar ${targetPlace.name}`,
          transitMode: defaultTransit,
          transitDurationMins: defaultTransitDuration,
          transitTips: tips || (targetPlace.metroStation ? `Descer na ${targetPlace.metroStation}` : 'Uber ou transporte público'),
        };

        return {
          ...day,
          items: [...day.items, newItem],
        };
      })
    );

    // Update place status to planned
    changePlaceStatus(placeId, 'planned');
  };

  const removeItemFromDay = (dayId: string, itemId: string) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const newItems = day.items
          .filter(item => item.id !== itemId)
          .map((item, idx) => ({ ...item, orderIndex: idx }));
        return { ...day, items: newItems };
      })
    );
  };

  const reorderDayItems = (dayId: string, sourceIndex: number, destIndex: number) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const newItems = Array.from(day.items);
        const [moved] = newItems.splice(sourceIndex, 1);
        newItems.splice(destIndex, 0, moved);
        return {
          ...day,
          items: newItems.map((item, idx) => ({ ...item, orderIndex: idx })),
        };
      })
    );
  };

  const updateItineraryItem = (dayId: string, itemId: string, data: Partial<ItineraryItem>) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          items: day.items.map(item => (item.id === itemId ? { ...item, ...data } : item)),
        };
      })
    );
  };

  // Notes Actions
  const addNote = (noteData: Omit<TripNote, 'id' | 'createdAt'>) => {
    const newNote: TripNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, noteData: Partial<TripNote>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...noteData } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleChecklistNote = (id: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  // Expenses Actions
  const addExpense = (expenseData: Omit<TripExpense, 'id' | 'createdAt'>) => {
    const newExpense: TripExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const resetToDefaultSPData = () => {
    setTrip(INITIAL_TRIP);
    setPlaces(INITIAL_PLACES);
    setItineraryDays(INITIAL_ITINERARY_DAYS);
    setNotes(INITIAL_NOTES);
    setExpenses(INITIAL_EXPENSES);
    setCurrentUser('Lucas');
    localStorage.clear();
    triggerCelebration();
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        places,
        itineraryDays,
        notes,
        expenses,
        currentUser,
        isSupabaseConnected,
        isSyncing,
        lastSyncTime,
        setCurrentUser,
        updateTrip,
        addParticipant,
        addPlace,
        updatePlace,
        deletePlace,
        votePlace,
        changePlaceStatus,
        addDay,
        updateDay,
        deleteDay,
        addItemToDay,
        removeItemFromDay,
        reorderDayItems,
        updateItineraryItem,
        addNote,
        updateNote,
        deleteNote,
        toggleChecklistNote,
        addExpense,
        deleteExpense,
        syncWithSupabase,
        resetToDefaultSPData,
        triggerCelebration,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
