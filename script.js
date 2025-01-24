let map;
let userMarker;
let carMarker = null;

function initMap() {
  // Inizializza la mappa
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.9028, lng: 12.4964 }, // Default: Roma
    zoom: 14,
  });

  // Recupera l'ultima posizione dell'utente salvata nel localStorage
  const savedUserLocation = JSON.parse(localStorage.getItem("userLocation"));
  if (savedUserLocation) {
    const savedLatLng = new google.maps.LatLng(savedUserLocation.lat, savedUserLocation.lng);
    userMarker = new google.maps.Marker({
      position: savedLatLng,
      map: map,
      title: "Ultima posizione conosciuta",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "blue",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "white",
      },
    });
    map.setCenter(savedLatLng); // Centra la mappa sull'ultima posizione salvata
  }

  // Ottieni la posizione attuale dell'utente
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const currentLatLng = new google.maps.LatLng(latitude, longitude);

      // Aggiorna il marker della posizione dell'utente
      if (userMarker) {
        userMarker.setPosition(currentLatLng);
        userMarker.setTitle("La tua posizione attuale");
      } else {
        userMarker = new google.maps.Marker({
          position: currentLatLng,
          map: map,
          title: "La tua posizione attuale",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "blue",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white",
          },
        });
      }

      // Centra la mappa sulla posizione attuale
      map.setCenter(currentLatLng);

      // Salva la nuova posizione nel localStorage
      localStorage.setItem("userLocation", JSON.stringify({ lat: latitude, lng: longitude }));
    },
    (err) => console.error("Errore nel rilevare la posizione", err),
    { enableHighAccuracy: true }
  );

  // Recupera la posizione dell'auto se salvata
  const savedCarLocation = JSON.parse(localStorage.getItem("carLocation"));
  if (savedCarLocation) {
    carMarker = new google.maps.Marker({
      position: savedCarLocation,
      map: map,
      title: "Posizione Auto",
      icon: {
        scale: 5,
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "white",
      },
    });
  }

  // Pulsante per salvare la posizione dell'auto
  document.getElementById("save-location").addEventListener("click", () => {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const carLatLng = { lat: latitude, lng: longitude };

        localStorage.setItem("carLocation", JSON.stringify(carLatLng));

        if (!carMarker) {
          carMarker = new google.maps.Marker({
            position: carLatLng,
            map: map,
            title: "Posizione Auto",
            icon: {
              scale: 5,
              fillColor: "red",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "white",
            },
          });
        } else {
          carMarker.setPosition(carLatLng);
        }

        const infoWindow = new google.maps.InfoWindow({
          content: "Posizione auto salvata!",
        });
        infoWindow.open(map, carMarker);
        setTimeout(() => infoWindow.close(), 3000);

        spinner.style.display = "none";
      },
      (err) => {
        console.error("Errore nel rilevare la posizione", err);
        spinner.style.display = "none";
      }
    );
  });

  // Pulsante per rimuovere la posizione dell'auto
  document.getElementById("remove-location").addEventListener("click", () => {
    if (carMarker) {
      carMarker.setMap(null);
      carMarker = null;
      localStorage.removeItem("carLocation");
      alert("Posizione dell'auto rimossa!");
    }
  });

  // Pulsante per centrare la mappa sulla posizione dell'utente
  document.getElementById("center-user").addEventListener("click", () => {
    const savedUserLocation = JSON.parse(localStorage.getItem("userLocation"));
    if (savedUserLocation) {
      const savedLatLng = new google.maps.LatLng(savedUserLocation.lat, savedUserLocation.lng);
      map.setCenter(savedLatLng);
      map.setZoom(16);
    } else {
      alert("Nessuna posizione dell'utente salvata!");
    }
  });

  // Pulsante per navigare verso la posizione dell'auto
  document.getElementById("navigate-to-car").addEventListener("click", () => {
    const savedCarLocation = JSON.parse(localStorage.getItem("carLocation"));

    if (savedCarLocation) {
      const { lat, lng } = savedCarLocation;

      // Costruisci l'URL per Google Maps
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

      // Apri il link in una nuova finestra o scheda
      window.open(googleMapsUrl, "_blank");
    } else {
      alert("Non è stata salvata alcuna posizione dell'auto!");
    }
  });


  // Pulsante per trovare l'auto
  document.getElementById("find-car").addEventListener("click", () => {
    const savedCarLocation = JSON.parse(localStorage.getItem("carLocation"));

    if (savedCarLocation) {
      const carLatLng = new google.maps.LatLng(savedCarLocation.lat, savedCarLocation.lng);

      map.setCenter(carLatLng);
      map.setZoom(20);
    } else {
      alert("Non è stata salvata alcuna posizione dell'auto!");
    }
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrato con successo:", registration);
      })
      .catch((error) => {
        console.error("Errore nella registrazione del Service Worker:", error);
      });
  });
}


// Inizializza la mappa al caricamento della pagina
window.onload = initMap;
