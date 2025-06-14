import {
  control,
  Icon,
  icon,
  latLng,
  map,
  marker,
  popup,
  tileLayer,
} from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config.js';

export default class Map {
  #zoom = 13;
  #map = null;

  static async getPlaceNameByCoordinate(latitude, longitude) {
    if (
      latitude == null ||
      longitude == null ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      console.warn('getPlaceNameByCoordinate: Invalid coordinates provided.');
      return 'Koordinat tidak valid';
    }
    try {
      const url = new URL(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json`
      );
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Geocoding API error: ${response.status}`);
        const errorData = await response.json().catch(() => ({}));
        console.error('Geocoding API error details:', errorData);
        return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(
          longitude
        ).toFixed(4)}`;
      }
      const json = await response.json();

      if (json.features && json.features.length > 0) {
        const feature = json.features[0];
        if (feature.place_name) return feature.place_name;
        if (feature.address) return feature.address;
        if (feature.text) return feature.text;

        const placeParts = feature.place_name_id
          ? feature.place_name_id.split(', ')
          : feature.place_name
          ? feature.place_name.split(', ')
          : [];
        if (placeParts.length >= 2) {
          return [placeParts.at(-2), placeParts.at(-1)]
            .filter(Boolean)
            .join(', ');
        } else if (placeParts.length === 1) {
          return placeParts[0];
        }
        return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(
          longitude
        ).toFixed(4)}`;
      }
      return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(
        longitude
      ).toFixed(4)}`;
    } catch (error) {
      console.error('getPlaceNameByCoordinate: exception:', error);
      return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(
        longitude
      ).toFixed(4)}`;
    }
  }

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject(new Error('Geolocation API tidak didukung di browser ini.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      });
    });
  }

  static async build(selector, options = {}) {
    let centerCoordinate = options.center || [-6.2, 106.816666];
    let zoomLevel = options.zoom || 13;

    if (options.locate && Map.isGeolocationAvailable()) {
      try {
        const position = await Map.getCurrentPosition();
        centerCoordinate = [
          position.coords.latitude,
          position.coords.longitude,
        ];
      } catch (error) {
        console.warn(
          'Gagal mendapatkan lokasi saat ini, menggunakan default:',
          error.message
        );
      }
    }

    const finalOptions = {
      ...options,
      center: centerCoordinate,
      zoom: zoomLevel,
    };
    return new Map(selector, finalOptions);
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions harus berupa objek');
    }
    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions harus berupa objek');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions harus menyertakan properti `content`.');
      }
      newMarker.bindPopup(popupOptions.content, popupOptions);
    }
    if (this.#map) newMarker.addTo(this.#map);
    return newMarker;
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!this.#map) return;
    const targetZoom = zoomLevel != null ? zoomLevel : this.#map.getZoom();
    this.#map.flyTo(latLng(coordinate), targetZoom, {
      animate: true,
      duration: 0.8,
    });
  }

  getCenter() {
    if (!this.#map) return { lat: 0, lng: 0 };
    const center = this.#map.getCenter();
    return {
      lat: center.lat,
      lng: center.lng,
    };
  }

  addMapEventListener(eventName, callback) {
    if (this.#map) {
      this.#map.on(eventName, callback);
    }
  }

  removeMapEventListener(eventName, callback) {
    if (this.#map) {
      this.#map.off(eventName, callback);
    }
  }

  constructor(selector, options = {}) {
    const mapElement = document.querySelector(selector);
    if (!mapElement) {
      throw new Error(
        `Elemen peta dengan selector "${selector}" tidak ditemukan.`
      );
    }

    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    );

    const openTopoMap = tileLayer(
      `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`,
      {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org/" target="_blank">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org/" target="_blank">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC-BY-SA</a>)',
        maxZoom: 17,
      }
    );

    let maptilerStreets;
    if (
      MAP_SERVICE_API_KEY &&
      MAP_SERVICE_API_KEY !== 'pewMnjSomgX7YlWsWD5a' &&
      MAP_SERVICE_API_KEY !== 'YOUR_MAPTILER_API_KEY_HERE'
    ) {
      maptilerStreets = tileLayer(
        `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAP_SERVICE_API_KEY}`,
        {
          attribution:
            '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
          maxZoom: 22,
        }
      );
    }

    this.#map = map(mapElement, {
      center: options.center || [-6.2, 106.816666],
      zoom: this.#zoom,
      scrollWheelZoom: options.scrollWheelZoom ?? false,
      layers: [maptilerStreets || tileOsm],
      ...options,
    });

    const baseMaps = {
      OpenStreetMap: tileOsm,
      OpenTopoMap: openTopoMap,
    };
    if (maptilerStreets) {
      baseMaps['MapTiler Streets'] = maptilerStreets;
    }

    control.layers(baseMaps).addTo(this.#map);
  }
}
