export interface User {
    id: string;
    email: string;
    role: 'staff' | 'owner' | 'client';
    name: string;
    created_at?: string;
}

export interface Pet {
    id: string;
    owner_email: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    temperament: string;
    allergies?: string;
    image_url?: string;
    notes?: string;
    vet_name?: string;
    vet_phone?: string;
    vaccination_records?: string;
    feeding_amount?: string;
    feeding_frequency?: string;
}

export interface UserWithPets extends User {
    pets: Pet[];
    unread_messages_count: number;
    oldest_unread_timestamp?: string;
}

export interface Booking {
    id: string;
    user_email: string;
    dog_id: string;
    service_type: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined';
    total_price: number;
    notes?: string;
    processed_by?: string;
    status_note?: string;
    created_at: string;
    is_paid: boolean;
    dog_name?: string;
    dog_photo_url?: string;
}

export interface EnrichedBooking extends Booking {
    dog_name?: string;
    owner_name?: string;
}

// Grouped Booking Request (for frontend display)
export interface GroupedBookingRequest {
    id: string; // generated key
    owner_name: string;
    owner_email: string;
    start_date: string;
    end_date: string;
    bookings: EnrichedBooking[];
}

export interface Message {
    id: number;
    sender_email: string;
    receiver_email: string;
    content: string;
    timestamp: string;
    is_read: number;
    sender_name?: string;
}

export interface AuditLog {
    id: number;
    user_email: string;
    action: string;
    timestamp: string;
    ip_address?: string;
    user_role?: string;
}

export interface DashboardStats {
    revenue: number;
    occupancy: number;
    active_guests: number;
    staff_count: number;
    monthly_revenue: { month: string; amount: number }[];
    booking_counts: { confirmed: number; cancelled: number; pending: number; completed: number };
}

// Frontend specific helpers
export interface GuestPet {
    id: string;
    name: string;
    breed: string;
    status: 'Active' | 'Check-in' | 'Check-out';
    alerts: string[];
    fed: boolean;
    walked: boolean;
    meds: boolean | null;
    img: string;
    owner_email: string;
    booking_id?: string;
}

export interface Notification {
    id: number;
    user_email: string;
    message: string;
    created_at: string;
    is_read: number | boolean;
    link?: string;
}

export interface Service {
    id: string;
    name: string;
    price: number;
    description?: string;
}

export interface DailyReport {
    id: number;
    booking_id: string;
    dog_id: string;
    image_url?: string;
    video_url?: string;
    mood: string;
    activity: string;
    notes?: string;
    ate_breakfast?: string;
    ate_dinner?: string;
    playtime_status?: string;
    created_at: string;
}

export interface Incident {
    id: string;
    booking_id: string;
    pet_id: string;
    content: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    timestamp: string;
}
