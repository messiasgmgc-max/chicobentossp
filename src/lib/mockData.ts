import { Place, ItineraryDay, TripNote, TripExpense, Trip, SPTransportLine } from '../types';

export const INITIAL_TRIP: Trip = {
  id: 'trip-chico-bento-sp',
  title: 'Chico Bento SP 🏙️',
  description: 'Nossa viagem incrível para São Paulo!',
  startDate: '2026-10-15',
  endDate: '2026-10-19',
  coverImage: 'https://images.unsplash.com/photo-1578059425556-9e900f074a3f?auto=format&fit=crop&w=1600&q=80',
  participants: ['Caca', 'Gui', 'Victrugo', 'Aninha'],
  currentUser: '',
  hotelName: '',
  hotelAddress: '',
  hotelCheckin: '',
  hotelCheckout: '',
  hotelNotes: '',
  arrivalAirport: '',
  arrivalDateTime: '',
  arrivalFlight: '',
  departureAirport: '',
  departureDateTime: '',
  departureFlight: '',
};

export const SP_METRO_LINES: SPTransportLine[] = [
  {
    id: 'l1',
    name: 'Linha 1 - Azul',
    type: 'metro',
    color: 'Azul',
    hexColor: '#00539B',
    stationsCount: 23,
    highlights: ['Liberdade', 'Sé', 'São Bento (25 de Março)', 'Tiradentes (Pinacoteca)', 'Luz'],
  },
  {
    id: 'l2',
    name: 'Linha 2 - Verde',
    type: 'metro',
    color: 'Verde',
    hexColor: '#008060',
    stationsCount: 14,
    highlights: ['Brigadeiro (Japan House/Sesc)', 'Trianon-MASP', 'Consolação (Paulista)', 'Vila Madalena'],
  },
  {
    id: 'l3',
    name: 'Linha 3 - Vermelha',
    type: 'metro',
    color: 'Vermelha',
    hexColor: '#EE3124',
    stationsCount: 18,
    highlights: ['Anhangabaú (Theatro Municipal)', 'Sé', 'República', 'Palmeiras-Barra Funda'],
  },
  {
    id: 'l4',
    name: 'Linha 4 - Amarela',
    type: 'viaquatro',
    color: 'Amarela',
    hexColor: '#FFF000',
    stationsCount: 11,
    highlights: ['Paulista', 'Oscar Freire (Jardins)', 'Fradique Coutinho (Pinheiros)', 'Faria Lima', 'República', 'Luz'],
  },
  {
    id: 'l5',
    name: 'Linha 5 - Lilás',
    type: 'viamobilidade',
    color: 'Lilás',
    hexColor: '#9B388D',
    stationsCount: 17,
    highlights: ['AACD-Servidor (Parque Ibirapuera)', 'Moema', 'Santa Cruz'],
  },
  {
    id: 'l9',
    name: 'Linha 9 - Esmeralda (CPTM/ViaMobilidade)',
    type: 'viamobilidade',
    color: 'Esmeralda',
    hexColor: '#00A88F',
    stationsCount: 20,
    highlights: ['Villa-Lobos Jaguaré (Parque Villa-Lobos)', 'Pinheiros', 'Berrini (Ponte Estaiada)', 'Morumbi'],
  },
];

// Clean state: Começar do zero conforme solicitado
export const INITIAL_PLACES: Place[] = [];

export const INITIAL_ITINERARY_DAYS: ItineraryDay[] = [];

export const INITIAL_NOTES: TripNote[] = [];

export const INITIAL_EXPENSES: TripExpense[] = [];
