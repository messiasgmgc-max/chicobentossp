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

// Generate RFC-compliant UUIDs for compatibility with Supabase UUID fields
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback if crypto.randomUUID fails in non-secure context
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  
  // Trip & Members management
  setCurrentUser: (user: string) => void;
  updateTrip: (tripData: Partial<Trip>) => void;
  updateTripLogistics: (logistics: Partial<Trip>) => void;
  addParticipant: (name: string) => void;
  updateParticipantName: (oldName: string, newName: string) => void;
  deleteParticipant: (name: string) => void;

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
  resetToCleanState: () => void;
  resetToDefaultSPData: () => void;
  triggerCelebration: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'chicobentossp_v1_';

// Purge legacy mock data cache keys once
try {
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sampatrip_v1_')) {
        localStorage.removeItem(key);
      }
    });
  }
} catch {
  // ignore storage errors
}

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
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}current_user`) || '';
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
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}current_user`, currentUser);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  // Supabase sync implementation
  const syncWithSupabase = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSyncing(true);
    try {
      // 1. Fetch remote trip (and create initial row if missing)
      const { data: remoteTrips, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .limit(1);

      let currentTripId = trip.id;
      if (!tripErr && remoteTrips && remoteTrips.length > 0) {
        const rTrip = remoteTrips[0];
        currentTripId = rTrip.id;
        setTrip(prev => ({
          ...prev,
          id: rTrip.id,
          title: rTrip.title || prev.title,
          description: rTrip.description ?? prev.description,
          startDate: rTrip.start_date || prev.startDate,
          endDate: rTrip.end_date || prev.endDate,
          coverImage: rTrip.cover_image || prev.coverImage,
          hotelName: rTrip.hotel_name ?? prev.hotelName,
          hotelAddress: rTrip.hotel_address ?? prev.hotelAddress,
          hotelCheckin: rTrip.hotel_checkin ?? prev.hotelCheckin,
          hotelCheckout: rTrip.hotel_checkout ?? prev.hotelCheckout,
          hotelNotes: rTrip.hotel_notes ?? prev.hotelNotes,
          arrivalAirport: rTrip.arrival_airport ?? prev.arrivalAirport,
          arrivalDateTime: rTrip.arrival_datetime ?? prev.arrivalDateTime,
          arrivalFlight: rTrip.arrival_flight ?? prev.arrivalFlight,
          departureAirport: rTrip.departure_airport ?? prev.departureAirport,
          departureDateTime: rTrip.departure_datetime ?? prev.departureDateTime,
          departureFlight: rTrip.departure_flight ?? prev.departureFlight,
        }));
      }

      // 2. Fetch remote members from trip_members table
      const { data: remoteMembers, error: membersErr } = await supabase
        .from('trip_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (!membersErr && remoteMembers && remoteMembers.length > 0) {
        const names = remoteMembers.map((m: any) => m.name);
        setTrip(prev => ({
          ...prev,
          participants: names,
        }));
      }

      // 3. Fetch remote places with votes
      const { data: remotePlaces, error: placesErr } = await supabase
        .from('places')
        .select('*, place_votes(*)');

      if (!placesErr && remotePlaces) {
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

      // 4. Fetch remote itinerary days and items
      const { data: remoteDays, error: daysErr } = await supabase
        .from('itinerary_days')
        .select('*, itinerary_items(*)')
        .order('day_number', { ascending: true });

      if (!daysErr && remoteDays) {
        const mappedDays: ItineraryDay[] = remoteDays.map((rd: any) => ({
          id: rd.id,
          tripId: rd.trip_id,
          dayNumber: rd.day_number,
          date: rd.date,
          title: rd.title,
          description: rd.description,
          items: (rd.itinerary_items || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((item: any) => ({
              id: item.id,
              dayId: item.day_id,
              placeId: item.place_id,
              orderIndex: item.order_index,
              startTime: item.start_time ? item.start_time.slice(0, 5) : undefined,
              endTime: item.end_time ? item.end_time.slice(0, 5) : undefined,
              notes: item.notes,
              transitMode: item.transit_mode as TransitMode,
              transitDurationMins: item.transit_duration_mins,
              transitTips: item.transit_tips,
            })),
        }));
        setItineraryDays(mappedDays);
      }

      // 5. Fetch remote notes
      const { data: remoteNotes, error: notesErr } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!notesErr && remoteNotes) {
        setNotes(
          remoteNotes.map((rn: any) => ({
            id: rn.id,
            tripId: rn.trip_id,
            category: rn.category,
            title: rn.title,
            content: rn.content,
            author: rn.author,
            isPinned: rn.is_pinned,
            createdAt: rn.created_at,
          }))
        );
      }

      // 6. Fetch remote expenses
      const { data: remoteExpenses, error: expensesErr } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!expensesErr && remoteExpenses) {
        setExpenses(
          remoteExpenses.map((re: any) => ({
            id: re.id,
            tripId: re.trip_id,
            title: re.title,
            amountCents: re.amount_cents,
            category: re.category,
            paidBy: re.paid_by,
            splitWith: re.split_with || [],
            date: re.date,
            createdAt: re.created_at,
          }))
        );
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.warn('Erro na sincronização com o Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [trip.id]);

  // Run sync once on initial mount
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Trip & Logistics Actions
  const updateTrip = (tripData: Partial<Trip>) => {
    setTrip(prev => {
      const updated = { ...prev, ...tripData };
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase
          .from('trips')
          .upsert({
            id: updated.id,
            title: updated.title,
            description: updated.description,
            start_date: updated.startDate,
            end_date: updated.endDate,
            cover_image: updated.coverImage,
          })
          .then();
      }
      return updated;
    });
  };

  const updateTripLogistics = (logistics: Partial<Trip>) => {
    setTrip(prev => {
      const updated = { ...prev, ...logistics };
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase
          .from('trips')
          .update({
            hotel_name: updated.hotelName,
            hotel_address: updated.hotelAddress,
            hotel_checkin: updated.hotelCheckin,
            hotel_checkout: updated.hotelCheckout,
            hotel_notes: updated.hotelNotes,
            arrival_airport: updated.arrivalAirport,
            arrival_datetime: updated.arrivalDateTime,
            arrival_flight: updated.arrivalFlight,
            departure_airport: updated.departureAirport,
            departure_datetime: updated.departureDateTime,
            departure_flight: updated.departureFlight,
          })
          .eq('id', updated.id)
          .then();
      }
      return updated;
    });
  };

  const addParticipant = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trip.participants.includes(trimmed)) return;

    setTrip(prev => ({
      ...prev,
      participants: [...prev.participants, trimmed],
    }));

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('trip_members').insert({ name: trimmed }).then();
    }
  };

  const updateParticipantName = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return;

    setTrip(prev => ({
      ...prev,
      participants: prev.participants.map(p => (p === oldName ? trimmedNew : p)),
    }));

    if (currentUser === oldName) {
      setCurrentUser(trimmedNew);
    }

    // Update places votes with new name
    setPlaces(prev =>
      prev.map(p => ({
        ...p,
        votes: (p.votes || []).map(v =>
          v.userName === oldName ? { ...v, userName: trimmedNew } : v
        ),
      }))
    );

    // Update notes authored by oldName
    setNotes(prev =>
      prev.map(n => (n.author === oldName ? { ...n, author: trimmedNew } : n))
    );

    // Update expenses paid by oldName or in splitWith
    setExpenses(prev =>
      prev.map(e => ({
        ...e,
        paidBy: e.paidBy === oldName ? trimmedNew : e.paidBy,
        splitWith: e.splitWith.map(m => (m === oldName ? trimmedNew : m)),
      }))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase
        .from('trip_members')
        .update({ name: trimmedNew })
        .eq('name', oldName)
        .then();
    }
  };

  const deleteParticipant = (name: string) => {
    setTrip(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== name),
    }));

    if (currentUser === name) {
      setCurrentUser('');
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('trip_members').delete().eq('name', name).then();
    }
  };

  // Place Actions
  const addPlace = (placeData: Omit<Place, 'id' | 'createdAt' | 'votes'>): Place => {
    const newPlaceId = generateUUID();
    const newVoteId = generateUUID();
    const now = new Date().toISOString();

    const newPlace: Place = {
      ...placeData,
      id: newPlaceId,
      createdAt: now,
      createdBy: currentUser || 'Viajante',
      votes: [
        {
          id: newVoteId,
          placeId: newPlaceId,
          userName: currentUser || 'Viajante',
          voteType: 'super_want',
          comment: 'Sugestão adicionada por mim!',
          createdAt: now,
        },
      ],
    };

    setPlaces(prev => [newPlace, ...prev]);
    triggerCelebration();

    // Async push to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase
        .from('places')
        .insert({
          id: newPlace.id,
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
        })
        .then(() => {
          supabase.from('place_votes').insert({
            id: newVoteId,
            place_id: newPlaceId,
            user_name: currentUser || 'Viajante',
            vote_type: 'super_want',
            comment: 'Sugestão adicionada por mim!',
          }).then();
        });
    }

    return newPlace;
  };

  const updatePlace = (id: string, placeData: Partial<Place>) => {
    setPlaces(prev => prev.map(p => (p.id === id ? { ...p, ...placeData } : p)));

    const supabase = getSupabaseClient();
    if (supabase) {
      const dbUpdate: any = {};
      if (placeData.name !== undefined) dbUpdate.name = placeData.name;
      if (placeData.category !== undefined) dbUpdate.category = placeData.category;
      if (placeData.neighborhood !== undefined) dbUpdate.neighborhood = placeData.neighborhood;
      if (placeData.address !== undefined) dbUpdate.address = placeData.address;
      if (placeData.description !== undefined) dbUpdate.description = placeData.description;
      if (placeData.status !== undefined) dbUpdate.status = placeData.status;

      supabase.from('places').update(dbUpdate).eq('id', id).then();
    }
  };

  const deletePlace = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
    setItineraryDays(prev =>
      prev.map(day => ({
        ...day,
        items: day.items.filter(item => item.placeId !== id),
      }))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('places').delete().eq('id', id).then();
    }
  };

  const votePlace = (placeId: string, voteType: 'up' | 'down' | 'super_want', comment?: string) => {
    const userToVote = currentUser || 'Viajante';
    const now = new Date().toISOString();
    const newVoteId = generateUUID();

    setPlaces(prev =>
      prev.map(p => {
        if (p.id !== placeId) return p;
        const currentVotes = p.votes || [];
        const existingVoteIndex = currentVotes.findIndex(v => v.userName === userToVote);

        let updatedVotes: PlaceVote[];
        if (existingVoteIndex >= 0) {
          updatedVotes = [...currentVotes];
          updatedVotes[existingVoteIndex] = {
            ...updatedVotes[existingVoteIndex],
            voteType,
            comment: comment !== undefined ? comment : updatedVotes[existingVoteIndex].comment,
          };
        } else {
          updatedVotes = [
            ...currentVotes,
            {
              id: newVoteId,
              placeId,
              userName: userToVote,
              voteType,
              comment,
              createdAt: now,
            },
          ];
        }

        return { ...p, votes: updatedVotes };
      })
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase
        .from('place_votes')
        .upsert(
          {
            place_id: placeId,
            user_name: userToVote,
            vote_type: voteType,
            comment: comment || null,
          },
          { onConflict: 'place_id,user_name' }
        )
        .then();
    }
  };

  const changePlaceStatus = (placeId: string, status: PlaceStatus) => {
    setPlaces(prev =>
      prev.map(p => (p.id === placeId ? { ...p, status } : p))
    );
    if (status === 'visited') {
      triggerCelebration();
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('places').update({ status }).eq('id', placeId).then();
    }
  };

  // Itinerary Actions
  const addDay = (title: string, date: string, description?: string) => {
    const newDayId = generateUUID();
    const newDay: ItineraryDay = {
      id: newDayId,
      dayNumber: itineraryDays.length + 1,
      title,
      date,
      description,
      items: [],
    };
    setItineraryDays(prev => [...prev, newDay]);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('itinerary_days').insert({
        id: newDayId,
        day_number: newDay.dayNumber,
        title,
        date,
        description,
      }).then();
    }
  };

  const updateDay = (dayId: string, data: Partial<ItineraryDay>) => {
    setItineraryDays(prev =>
      prev.map(d => (d.id === dayId ? { ...d, ...data } : d))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      const dbUpdate: any = {};
      if (data.title !== undefined) dbUpdate.title = data.title;
      if (data.date !== undefined) dbUpdate.date = data.date;
      if (data.description !== undefined) dbUpdate.description = data.description;
      supabase.from('itinerary_days').update(dbUpdate).eq('id', dayId).then();
    }
  };

  const deleteDay = (dayId: string) => {
    setItineraryDays(prev =>
      prev
        .filter(d => d.id !== dayId)
        .map((d, index) => ({ ...d, dayNumber: index + 1 }))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('itinerary_days').delete().eq('id', dayId).then();
    }
  };

  const addItemToDay = (dayId: string, placeId: string, notes?: string, transitTips?: string) => {
    const targetPlace = places.find(p => p.id === placeId);
    if (!targetPlace) return;

    const newItemId = generateUUID();

    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;

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
          id: newItemId,
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

        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.from('itinerary_items').insert({
            id: newItemId,
            day_id: dayId,
            place_id: placeId,
            order_index: newItem.orderIndex,
            start_time: newItem.startTime ? `${newItem.startTime}:00` : null,
            notes: newItem.notes,
            transit_mode: newItem.transitMode,
            transit_duration_mins: newItem.transitDurationMins,
            transit_tips: newItem.transitTips,
          }).then();
        }

        return {
          ...day,
          items: [...day.items, newItem],
        };
      })
    );

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

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('itinerary_items').delete().eq('id', itemId).then();
    }
  };

  const reorderDayItems = (dayId: string, sourceIndex: number, destIndex: number) => {
    setItineraryDays(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const newItems = Array.from(day.items);
        const [moved] = newItems.splice(sourceIndex, 1);
        newItems.splice(destIndex, 0, moved);
        const reordered = newItems.map((item, idx) => ({ ...item, orderIndex: idx }));

        const supabase = getSupabaseClient();
        if (supabase) {
          reordered.forEach(item => {
            supabase
              .from('itinerary_items')
              .update({ order_index: item.orderIndex })
              .eq('id', item.id)
              .then();
          });
        }

        return {
          ...day,
          items: reordered,
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

    const supabase = getSupabaseClient();
    if (supabase) {
      const dbUpdate: any = {};
      if (data.startTime !== undefined) dbUpdate.start_time = data.startTime ? `${data.startTime}:00` : null;
      if (data.notes !== undefined) dbUpdate.notes = data.notes;
      if (data.transitMode !== undefined) dbUpdate.transit_mode = data.transitMode;
      if (data.transitDurationMins !== undefined) dbUpdate.transit_duration_mins = data.transitDurationMins;
      if (data.transitTips !== undefined) dbUpdate.transit_tips = data.transitTips;

      supabase.from('itinerary_items').update(dbUpdate).eq('id', itemId).then();
    }
  };

  // Notes Actions
  const addNote = (noteData: Omit<TripNote, 'id' | 'createdAt'>) => {
    const newNoteId = generateUUID();
    const now = new Date().toISOString();
    const newNote: TripNote = {
      ...noteData,
      id: newNoteId,
      createdAt: now,
    };
    setNotes(prev => [newNote, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('notes').insert({
        id: newNoteId,
        category: newNote.category,
        title: newNote.title,
        content: newNote.content,
        author: newNote.author,
        is_pinned: newNote.isPinned || false,
      }).then();
    }
  };

  const updateNote = (id: string, noteData: Partial<TripNote>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...noteData } : n)));

    const supabase = getSupabaseClient();
    if (supabase) {
      const dbUpdate: any = {};
      if (noteData.title !== undefined) dbUpdate.title = noteData.title;
      if (noteData.content !== undefined) dbUpdate.content = noteData.content;
      if (noteData.category !== undefined) dbUpdate.category = noteData.category;
      if (noteData.isPinned !== undefined) dbUpdate.is_pinned = noteData.isPinned;
      supabase.from('notes').update(dbUpdate).eq('id', id).then();
    }
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('notes').delete().eq('id', id).then();
    }
  };

  const toggleChecklistNote = (id: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  // Expenses Actions
  const addExpense = (expenseData: Omit<TripExpense, 'id' | 'createdAt'>) => {
    const newExpenseId = generateUUID();
    const now = new Date().toISOString();
    const newExpense: TripExpense = {
      ...expenseData,
      id: newExpenseId,
      createdAt: now,
    };
    setExpenses(prev => [newExpense, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('expenses').insert({
        id: newExpenseId,
        title: newExpense.title,
        amount_cents: newExpense.amountCents,
        category: newExpense.category,
        paid_by: newExpense.paidBy,
        split_with: newExpense.splitWith,
        date: newExpense.date,
      }).then();
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('expenses').delete().eq('id', id).then();
    }
  };

  const resetToCleanState = () => {
    setTrip(INITIAL_TRIP);
    setPlaces([]);
    setItineraryDays([]);
    setNotes([]);
    setExpenses([]);
    setCurrentUser('');
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
        updateTripLogistics,
        addParticipant,
        updateParticipantName,
        deleteParticipant,
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
        resetToCleanState,
        resetToDefaultSPData: resetToCleanState,
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
