import { HomeConfigResponse } from '../types/ads';

const MOCK_CONFIG: HomeConfigResponse = {
    carousels: {
        'home_hero': [
            {
                id: 'c1',
                placement_id: 'home_hero',
                title: '50% Off Color Prints',
                image_url: 'https://via.placeholder.com/600x300/FF6B35/FFFFFF?text=50%25+OFF+Color',
                priority: 10,
                action_url: 'jusprint://print/upload',
                bg_color: '#FF6B35'
            },
            {
                id: 'c2',
                placement_id: 'home_hero',
                title: 'Project Submission Open',
                image_url: 'https://via.placeholder.com/600x300/004E89/FFFFFF?text=Submit+Project',
                priority: 5,
                action_url: 'jusprint://projects',
                bg_color: '#004E89'
            }
        ]
    },
    banners: {
        'print_dashboard_top': {
            id: 'b1',
            placement_id: 'print_dashboard_top',
            title: 'Free Binding Weekend',
            image_url: 'https://via.placeholder.com/800x200/4ECDC4/333333?text=Free+Binding+This+Weekend',
            priority: 1,
            action_url: 'jusprint://print/upload',
            bg_color: '#4ECDC4'
        }
    },
    modals: [
        {
            id: 'm1',
            image_url: 'https://via.placeholder.com/600x800/FF0000/FFFFFF?text=Server+Maintenance+Alert',
            priority: 100,
            show_once_per_session: true,
            action_url: ''
        }
    ],
    ttl: 300
};

// Simulate API call with caching logic (simplified for React Native without AsyncStorage setup yet)
export const fetchHomeConfig = async (): Promise<HomeConfigResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Ad Config Fetched from Mock Backend");
            resolve(MOCK_CONFIG);
        }, 800);
    });
};
