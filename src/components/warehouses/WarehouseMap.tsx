'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Warehouse } from '@/types';
import L from 'leaflet';
import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png'
});

type Props = {
  warehouses: Warehouse[];
};

type FitBoundsProps = {
  warehouses: Warehouse[];
};

function FitBoundsToMarkers({ warehouses }: FitBoundsProps) {
    const map = useMap();

    useEffect(() => {
        if (warehouses.length === 0) { return; }

        // Create bounds from all markers
        const bounds = L.latLngBounds([]);
        warehouses.forEach((warehouse) => {
            bounds.extend([warehouse.address.latitude, warehouse.address.longitude]);
        });

        // Fit map to bounds
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, warehouses]);

    return null;
}

export default function WarehouseMap({ warehouses }: Props) {
    const validWarehouses = warehouses.filter((w) => w.address?.latitude && w.address?.longitude);

    if (validWarehouses.length === 0) {
        return null;
    }

    const center: [number, number] = [validWarehouses[0].address.latitude, validWarehouses[0].address.longitude];

    return (
        <MapContainer center={center} zoom={6} className="h-[500px] w-full rounded-md">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <FitBoundsToMarkers warehouses={validWarehouses} />

            {validWarehouses.map((wh) => (
                <Marker key={wh.id} position={[wh.address.latitude, wh.address.longitude]}>
                    <Popup>
                        <strong>{wh.name}</strong>
                        <div>{wh.address.city}</div>
                        <div className="text-xs text-muted-foreground">{wh.code}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
