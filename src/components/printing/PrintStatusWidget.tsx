import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ProgressBar, useTheme, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Adjust import path
import { maximizeJob, updateJobStatus, updateJobProgress, setLockerCode, clearJob } from '../../store/slices/printSlice'; // Adjust import path

export const PrintStatusWidget = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { activeJob } = useSelector((state: RootState) => state.print);

    // WebSocket updates are handled globally by useWebSocket hook in AppNavigator

    if (!activeJob) return null;

    const getIcon = () => {
        switch (activeJob.status) {
            case 'paid': return 'check-circle';
            case 'queued': return 'clock-outline';
            case 'printing': return 'printer';
            case 'ready': return 'package-variant';
            case 'completed': return 'check-decagram';
            default: return 'printer';
        }
    };

    const getLabel = () => {
        // Debug: console.log('[StatusWidget] Current Status:', activeJob.status);
        switch (activeJob.status) {
            case 'paid': return 'Payment Verified';
            case 'queued': return 'In Queue';
            case 'printing': return 'Printing...';
            case 'ready': return 'Ready for Pickup! 🎉';
            case 'completed': return 'Job Completed';
            default: return `Status: ${activeJob.status}`;
        }
    };

    const handlePress = () => {
        dispatch(maximizeJob());
        navigation.navigate('JobStatus');
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.primary }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    <View style={styles.iconCircle}>
                        <Icon name={getIcon()} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title}>{getLabel()}</Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {activeJob.documentName} • {activeJob.estimatedTime}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {activeJob.status === 'printing' && (
                        <Text style={styles.percentage}>{Math.round(activeJob.progress * 100)}%</Text>
                    )}
                    
                    {(activeJob.status === 'ready' || activeJob.status === 'completed') ? (
                        <TouchableOpacity 
                            onPress={(e) => {
                                e.stopPropagation();
                                dispatch(clearJob());
                            }}
                            style={styles.closeBtn}
                        >
                            <Icon name="close" size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <Icon name="chevron-up" size={24} color="white" />
                    )}
                </View>
            </View>

            {activeJob.status === 'printing' && (
                <ProgressBar
                    progress={activeJob.progress}
                    color="white"
                    style={styles.progressBar}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 16, // Just above tab bar
        left: 16,
        right: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    percentage: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
        fontSize: 14,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    closeBtn: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        marginLeft: 8,
    },
});
