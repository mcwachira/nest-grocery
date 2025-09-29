"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";

// Fix default marker icons (for Next.js bundling)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon: Icon = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
    const position: [number, number] = [40.7128, -74.006]; // NYC

    return (
        <MapContainer
            center={position}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full min-h-[400px] rounded-xl overflow-hidden"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={position} icon={DefaultIcon}>
                <Popup>We are here! 📍</Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;
