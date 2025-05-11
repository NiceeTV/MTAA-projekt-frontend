export interface MarkerData {
    marker_id: string;
    marker_title: string;
    marker_description: string;
    location_x: number;
    location_y: number;
}

export interface addTripMarker {
    marker_id: string;
    marker_title: string;
    marker_date?: string;
    isNew?: boolean;
}