'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type DeliveryLocationMapProps = {
  latitude: number;
  longitude: number;
  onPositionChange: (latitude: number, longitude: number) => void;
};

export default function DeliveryLocationMap({
  latitude,
  longitude,
  onPositionChange,
}: DeliveryLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onPositionChangeRef = useRef(onPositionChange);
  const initialPositionRef = useRef({ latitude, longitude });

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    const initializeMap = async () => {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([initialPositionRef.current.latitude, initialPositionRef.current.longitude], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: '',
        html: '<div style="width:30px;height:30px;background:#d70018;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35)"><span style="display:block;width:8px;height:8px;margin:8px;background:white;border-radius:50%"></span></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([initialPositionRef.current.latitude, initialPositionRef.current.longitude], {
        draggable: true,
        icon: markerIcon,
        title: 'Kéo ghim đến đúng vị trí giao hàng',
      }).addTo(map);

      const publishPosition = (lat: number, lng: number) => {
        marker.setLatLng([lat, lng]);
        onPositionChangeRef.current(lat, lng);
      };

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        publishPosition(position.lat, position.lng);
      });
      map.on('click', (event: L.LeafletMouseEvent) => {
        publishPosition(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 0);
    };

    void initializeMap();

    return () => {
      cancelled = true;
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.panTo([latitude, longitude]);
  }, [latitude, longitude]);

  return <div ref={containerRef} className="h-64 w-full bg-gray-100 sm:h-72" />;
}
