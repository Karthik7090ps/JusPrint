export interface AdAction {
    type: 'link' | 'deep_link' | 'modal';
    payload: string; // URL or Modal ID
}

export interface AdContent {
    id: string;
    placement_id: string; // 'home_hero', 'dashboard_banner', etc.
    title: string;
    image_url: string;
    action_url?: string;
    priority: number;
    bg_color?: string;
    metadata?: Record<string, any>;
}

export interface AdModal {
    id: string;
    image_url: string;
    action_url?: string;
    priority: number;
    show_once_per_session: boolean;
}

export interface HomeConfigResponse {
    carousels: Record<string, AdContent[]>; // key = placement_id
    banners: Record<string, AdContent>;      // key = placement_id
    modals: AdModal[];
    ttl: number; // seconds
}
