import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { colors } from '../../theme/colors';

const DUMMY_JOBS = [
    { id: 1, name: 'Physics Lab.pdf', pages: 12, date: '2 hrs ago', status: 'Printed' },
    { id: 2, name: 'Math Assignments.pdf', pages: 3, date: 'Yesterday', status: 'Printed' },
    { id: 3, name: 'Resume.docx', pages: 1, date: '2 days ago', status: 'Failed' },
];

export const RecentJobsCarousel = () => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text variant="titleMedium" style={styles.title}>Recent Prints</Text>
                <Text variant="labelLarge" style={{ color: colors.primary }}>View All</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {DUMMY_JOBS.map((job) => (
                    <Card key={job.id} style={styles.card} mode="contained">
                        <View style={styles.thumbnailPlaceholder}>
                            <Text style={styles.fileType}>{job.name.split('.').pop()?.toUpperCase()}</Text>
                        </View>
                        <Card.Content style={styles.cardContent}>
                            <Text variant="labelLarge" numberOfLines={1} style={styles.jobName}>{job.name}</Text>
                            <Text variant="bodySmall" style={styles.jobDetails}>{job.pages} pgs • {job.date}</Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    card: {
        width: 150,
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: colors.surface,
    },
    thumbnailPlaceholder: {
        height: 90,
        backgroundColor: '#FFE0D1', // Light orange tint
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileType: {
        fontWeight: '900',
        color: colors.primary,
        fontSize: 20,
    },
    cardContent: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    jobName: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
    jobDetails: {
        marginTop: 4,
        color: colors.textSecondary,
    },
});
