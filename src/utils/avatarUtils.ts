export const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '??';

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAvatarColor = (name: string | null | undefined): string => {
    if (!name) return '#999';

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        '#2ECC71', // Emerald
        '#3498DB', // Peter River
        '#9B59B6', // Amethyst
        '#E67E22', // Carrot
        '#E74C3C', // Alizarin
        '#1ABC9C', // Turquoise
        '#F1C40F', // Sun Flower
        '#34495E', // Wet Asphalt
    ];

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
