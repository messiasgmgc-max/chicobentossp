import React, { useState } from 'react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar, TabType } from './components/layout/Navbar';
import { DayPlanner } from './components/itinerary/DayPlanner';
import { PlacesCatalog } from './components/places/PlacesCatalog';
import { PlaceDetailsModal } from './components/places/PlaceDetailsModal';
import { AddPlaceModal } from './components/places/AddPlaceModal';
import { GoogleMapView } from './components/map/GoogleMapView';
import { TransitGuide } from './components/transit/TransitGuide';
import { NotesHub } from './components/notes/NotesHub';
import { SettingsModal } from './components/settings/SettingsModal';
import { UserSelectModal } from './components/auth/UserSelectModal';
import { Place } from './types';
import { Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useTrip();

  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [selectedPlaceForDetails, setSelectedPlaceForDetails] = useState<Place | null>(null);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(false);

  const handleOpenPlaceDetails = (place: Place) => {
    setSelectedPlaceForDetails(place);
  };

  const handleQuickAddToDay = (place: Place) => {
    setSelectedPlaceForDetails(place);
  };

  // Show user select modal automatically if currentUser is empty
  const shouldShowUserSelectModal = !currentUser || isUserSelectModalOpen;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-orange-500 selection:text-white pb-28 md:pb-12 overflow-x-hidden">
      {/* Top Navbar & Fixed Mobile Bottom Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddPlace={() => setIsAddPlaceModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenUserSelect={() => setIsUserSelectModalOpen(true)}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {activeTab === 'itinerary' && (
          <DayPlanner
            onOpenCreateNewPlace={() => setIsAddPlaceModalOpen(true)}
            onSelectPlaceForDetails={handleOpenPlaceDetails}
          />
        )}

        {activeTab === 'places' && (
          <PlacesCatalog
            onOpenDetails={handleOpenPlaceDetails}
            onOpenAddPlace={() => setIsAddPlaceModalOpen(true)}
            onQuickAddToDay={handleQuickAddToDay}
          />
        )}

        {activeTab === 'map' && (
          <GoogleMapView onSelectPlace={handleOpenPlaceDetails} />
        )}

        {activeTab === 'transit' && <TransitGuide />}

        {activeTab === 'notes' && <NotesHub />}
      </main>

      {/* User Selection & Profile Modal (Startup + On Demand) */}
      <UserSelectModal
        isOpen={shouldShowUserSelectModal}
        onClose={() => setIsUserSelectModalOpen(false)}
        canDismiss={Boolean(currentUser)}
      />

      {/* Place Details Modal */}
      <PlaceDetailsModal
        place={selectedPlaceForDetails}
        isOpen={Boolean(selectedPlaceForDetails)}
        onClose={() => setSelectedPlaceForDetails(null)}
        onQuickAddToDay={handleQuickAddToDay}
      />

      {/* Add Custom Place Modal */}
      <AddPlaceModal
        isOpen={isAddPlaceModalOpen}
        onClose={() => setIsAddPlaceModalOpen(false)}
      />

      {/* Settings / Supabase / Google Maps Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-8 mb-4 border-t border-slate-800/60 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          Feito com <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline" /> para nossa viagem - Chico Bento SP 🏙️
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Chico Bento SP • Integração Google Maps & Supabase
        </p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <TripProvider>
      <AppContent />
    </TripProvider>
  );
}

export default App;
