'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Warehouse } from '@/types';
import L from 'leaflet';

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

export default function WarehouseMap({ warehouses }: Props) {
    const validWarehouses = warehouses.filter((w) => w.address?.latitude && w.address?.longitude);

    if (validWarehouses.length === 0) {
        return null;
    }

    const center: [number, number] = [validWarehouses[0].address.latitude, validWarehouses[0].address.longitude];

    return (
        <MapContainer center={center} zoom={6} className="h-[500px] w-full rounded-md">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />

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
