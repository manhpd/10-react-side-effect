import { useEffect, useRef, useState } from 'react';

import Places from './components/Places.js';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.js';
import DeleteConfirmation from './components/DeleteConfirmation.js';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

export interface IPlace {
  id: string;
  title: string;
  image: {
    src: string;
    alt: string;
  };
}

function App() {
  const modal = useRef<{ open: () => void; close: () => void } | null>(null);
  const selectedPlace = useRef<string | undefined>(undefined);
  const [pickedPlaces, setPickedPlaces] = useState<IPlace[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<IPlace[]>(AVAILABLE_PLACES);

  useEffect(() => {
    const storeIds = JSON.parse(localStorage.getItem('pickedPlaces') || '[]');
    const storedPlaces = storeIds
      .map((id: string) => AVAILABLE_PLACES.find((place) => place.id === id))
      .filter((place: IPlace) => place !== undefined) as IPlace[];
    setPickedPlaces(storedPlaces);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude);
      setAvailablePlaces(sortedPlaces);
    });
  }, []);
  

  function handleStartRemovePlace(id: string) {
    modal.current?.open();
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    modal.current?.close();
  }

  function handleSelectPlace(id: string) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      if (place) {
        return [place, ...prevPickedPlaces];
      }
      return prevPickedPlaces;
    });
    
    const storeIds = JSON.parse(localStorage.getItem('pickedPlaces') || '[]');
    if (storeIds.indexOf(id) === -1) {
      localStorage.setItem('pickedPlaces', JSON.stringify([...storeIds, id]));
    }
  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current?.close();

    const storeIds = JSON.parse(localStorage.getItem('pickedPlaces') || '[]');
    localStorage.setItem(
      'pickedPlaces',
      JSON.stringify(storeIds.filter((id: string) => id !== selectedPlace.current))
    );
  }

  return (
    <>
      <Modal ref={modal}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText='Sorting places by distance ...'
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
