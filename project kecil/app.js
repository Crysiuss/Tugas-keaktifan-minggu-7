class Marker {
  constructor(lat, lng, type = "default") {
    this.lat = lat;
    this.lng = lng;
    this.type = type;
    this.instance = this._createLeafletMarker();
  }

  _createLeafletMarker() {
    const colors = {
      red: "#f44336",
      blue: "#2196f3",
      green: "#4caf50",
      default: "#ff9800",
    };

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
                background-color: ${colors[this.type] || colors.default}; 
                width: 15px; 
                height: 15px; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg); 
                border: 2px solid white; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
             "></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 15],
    });

    const markerInstance = L.marker([this.lat, this.lng], { icon: customIcon });

    markerInstance.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      this.updateInfoPanel();
    });

    return markerInstance;
  }

  updateInfoPanel() {
    const info = document.getElementById("info");
    info.innerHTML = `
      <strong>Marker Info:</strong><br>
      Tipe: <span style="color:${this.type}">${this.type.toUpperCase()}</span><br>
      Koordinat: ${this.lat.toFixed(5)}, ${this.lng.toFixed(5)}
    `;
  }
}

class MapManager {
  constructor(mapId) {
    this.map = L.map(mapId).setView([-7.8013672, 110.3647568], 13);
    this.markerLayer = L.layerGroup().addTo(this.map);
    L.control
      .scale({
        position: "bottomleft",
        metric: true,
      })
      .addTo(this.map);
    this.layers = {
      "Street View": L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps",
      }),

      Satellite: L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps Satellite",
      }),

      "Simple (OSM)": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }),
    };

    this.layers["Street View"].addTo(this.map);

    L.control.layers(this.layers, { Markers: this.markerLayer }).addTo(this.map);

    this.initListeners();
  }

  addNewMarker(lat, lng, type) {
    const newMarker = new Marker(lat, lng, type);
    this.markerLayer.addLayer(newMarker.instance);
  }

  addRandomMarkerInView() {
    const bounds = this.map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const randomLat = sw.lat + Math.random() * (ne.lat - sw.lat);
    const randomLng = sw.lng + Math.random() * (ne.lng - sw.lng);

    const types = ["red", "blue", "green"];
    this.addNewMarker(randomLat, randomLng, types[Math.floor(Math.random() * 3)]);
  }

  initListeners() {
    document.getElementById("btnAdd").addEventListener("click", () => this.addRandomMarkerInView());

    document.getElementById("btnClear").addEventListener("click", () => {
      this.markerLayer.clearLayers();
      document.getElementById("info").textContent = "Semua marker telah dihapus.";
    });

    document.getElementById("toggleLayers").addEventListener("change", (e) => {
      if (e.target.checked) this.map.addLayer(this.markerLayer);
      else this.map.removeLayer(this.markerLayer);
    });

    this.map.on("click", (e) => this.addNewMarker(e.latlng.lat, e.latlng.lng, "Klik"));
  }
}

const myGIS = new MapManager("map");
