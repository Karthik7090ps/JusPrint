import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, SegmentedButtons, Chip, Switch, Divider, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { pick } from '@react-native-documents/picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock backend pricing service
const fetchPricingFromBackend = async (settings: any) => {
    // Simulates backend calculation based on settings
    const basePrice = settings.colorMode === 'color' ? 5 : 2;
    const sideMultiplier = settings.sides === 'double' ? 0.8 : 1; // Discount for duplex
    const perPage = basePrice * sideMultiplier;
    const total = Math.round(perPage * settings.totalPages);
    return { perPage, total, currency: '₹' };
};

export const DocumentUpload = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const existingDoc = route?.params?.document;
    const presetSettings = route?.params?.presetSettings;
    const initialPrinter = route?.params?.printer;

    const [document, setDocument] = useState<any>(existingDoc || null);
    const [selectedPrinter, setSelectedPrinter] = useState<any>(initialPrinter || null);
    const [activeTab, setActiveTab] = useState('basic');
    const [pricing, setPricing] = useState({ perPage: 2, total: 0, currency: '₹' });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        copies: 1,
        colorMode: 'bw', // bw | color
        sides: 'single', // single | double
        orientation: 'portrait', // portrait | landscape
        pageSize: 'A4',
        pagesPerSheet: 1, // 1 | 2 | 4
        totalPages: existingDoc?.pages || 10, // Default to 10 if new doc
        ...presetSettings
    });

    // Auto-open picker if no document provided
    useEffect(() => {
        if (!existingDoc && !document) {
            handlePickDocument();
        }
    }, []);

    // Update printer if returned from selection
    useEffect(() => {
        if (route.params?.selectedPrinter) {
            setSelectedPrinter(route.params.selectedPrinter);
        }
    }, [route.params?.selectedPrinter]);

    useEffect(() => {
        updatePricing();
    }, [settings]);

    const updatePricing = async () => {
        const price = await fetchPricingFromBackend(settings);
        setPricing(price);
    };

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePickDocument = async () => {
        try {
            const [result] = await pick({ mode: 'open' });
            if (result) {
                console.log('Picked file:', result);
                setDocument({
                    name: result.name || 'Document',
                    uri: result.uri,
                    type: result.type,
                    pages: 10, // In real app, we parse PDF to get page count
                });
                updateSetting('totalPages', 10);
            }
        } catch (e: any) {
            if (e?.code === 'DOCUMENT_PICKER_CANCELED') {
                console.log('User cancelled picker');
            } else {
                console.error('Picker Error:', e);
                setErrorMsg('Failed to pick document. Please try again.');
            }
        }
    };

    const handleProceed = () => {
        navigation.navigate('PaymentScreen', { document, settings, pricing, printer: selectedPrinter });
    };

    return (
        <View style={styles.container}>
            <AppHeader showLogo={false} title="Document Preview" showBack={true} showWallet={false} />

            {/* Printer Selection Bar */}
            <TouchableOpacity
                style={styles.printerBar}
                onPress={() => navigation.navigate('PrinterSelection', { returnRoute: 'DocumentUpload' })}
            >
                <View style={styles.printerInfo}>
                    <View style={[styles.printerIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Icon name="printer" size={20} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text variant="labelSmall" style={{ color: '#666' }}>Printing to</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#1A1A2E' }}>
                            {selectedPrinter?.location || 'Select Printer'}
                        </Text>
                    </View>
                </View>
                <View style={styles.changeBtn}>
                    <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: 'bold' }}>CHANGE</Text>
                    <Icon name="chevron-right" size={16} color={theme.colors.primary} />
                </View>
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Document Preview - Top Section */}
                <View style={styles.previewSection}>
                    {document ? (
                        <View style={styles.previewCard}>
                            {/* Live Preview with Settings Applied */}
                            <View style={[
                                styles.previewPage,
                                settings.orientation === 'landscape' && styles.previewLandscape
                            ]}>
                                <Icon name="file-pdf-box" size={40} color="#E74C3C" />
                                <Text variant="bodySmall" style={{ marginTop: 8 }} numberOfLines={1}>{document.name}</Text>
                                <View style={styles.settingsBadges}>
                                    <Chip compact textStyle={{ fontSize: 9 }}>{settings.colorMode.toUpperCase()}</Chip>
                                    <Chip compact textStyle={{ fontSize: 9 }}>{settings.sides === 'double' ? '2-sided' : '1-sided'}</Chip>
                                    <Chip compact textStyle={{ fontSize: 9 }}>{settings.orientation}</Chip>
                                </View>
                            </View>
                            <View style={styles.pageInfo}>
                                <Text variant="titleSmall">{settings.totalPages} pages</Text>
                                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {pricing.currency}{pricing.total}
                                </Text>
                            </View>
                            {/* Change File Button */}
                            <Button
                                compact
                                mode="text"
                                onPress={handlePickDocument}
                                style={{ marginTop: 8 }}
                            >
                                Change Document
                            </Button>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
                            <Icon name="file-upload-outline" size={48} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ marginTop: 12 }}>Tap to Upload</Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>PDF, DOCX, PPT</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Settings Section */}
                {document && (
                    <View style={styles.settingsSection}>
                        {/* Tab Switcher */}
                        <SegmentedButtons
                            value={activeTab}
                            onValueChange={setActiveTab}
                            buttons={[
                                { value: 'basic', label: 'Basic' },
                                { value: 'advanced', label: 'Advanced' },
                            ]}
                            style={styles.tabs}
                        />

                        {activeTab === 'basic' ? (
                            <View style={styles.settingsGrid}>
                                {/* Color Mode */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Print Type</Text>
                                    <View style={styles.optionButtons}>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.colorMode === 'bw' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('colorMode', 'bw')}
                                        >
                                            <Text style={settings.colorMode === 'bw' ? styles.optionTextActive : styles.optionText}>B&W</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.colorMode === 'color' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('colorMode', 'color')}
                                        >
                                            <Text style={settings.colorMode === 'color' ? styles.optionTextActive : styles.optionText}>Color</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Sides */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Sides</Text>
                                    <View style={styles.optionButtons}>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.sides === 'single' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('sides', 'single')}
                                        >
                                            <Text style={settings.sides === 'single' ? styles.optionTextActive : styles.optionText}>Single</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.sides === 'double' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('sides', 'double')}
                                        >
                                            <Text style={settings.sides === 'double' ? styles.optionTextActive : styles.optionText}>Double</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Copies */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Copies</Text>
                                    <View style={styles.quantityControl}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateSetting('copies', Math.max(1, settings.copies - 1))}
                                        >
                                            <Icon name="minus" size={18} />
                                        </TouchableOpacity>
                                        <Text variant="titleMedium" style={{ minWidth: 30, textAlign: 'center' }}>{settings.copies}</Text>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateSetting('copies', settings.copies + 1)}
                                        >
                                            <Icon name="plus" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.settingsGrid}>
                                {/* Orientation - No Auto, default Portrait */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Orientation</Text>
                                    <View style={styles.optionButtons}>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.orientation === 'portrait' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('orientation', 'portrait')}
                                        >
                                            <Text style={settings.orientation === 'portrait' ? styles.optionTextActive : styles.optionText}>Portrait</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.optionBtn, settings.orientation === 'landscape' && styles.optionBtnActive]}
                                            onPress={() => updateSetting('orientation', 'landscape')}
                                        >
                                            <Text style={settings.orientation === 'landscape' ? styles.optionTextActive : styles.optionText}>Landscape</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Pages Per Sheet - Aligned */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Pages/Sheet</Text>
                                    <View style={styles.optionButtons}>
                                        {[1, 2, 4].map(n => (
                                            <TouchableOpacity
                                                key={n}
                                                style={[styles.optionBtn, settings.pagesPerSheet === n && styles.optionBtnActive, { minWidth: 40 }]}
                                                onPress={() => updateSetting('pagesPerSheet', n)}
                                            >
                                                <Text style={settings.pagesPerSheet === n ? styles.optionTextActive : styles.optionText}>{n}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Page Size */}
                                <View style={styles.settingRow}>
                                    <Text variant="bodyMedium">Page Size</Text>
                                    <View style={styles.optionButtons}>
                                        {['A4', 'A3', 'Letter'].map(size => (
                                            <TouchableOpacity
                                                key={size}
                                                style={[styles.optionBtn, settings.pageSize === size && styles.optionBtnActive]}
                                                onPress={() => updateSetting('pageSize', size)}
                                            >
                                                <Text style={settings.pageSize === size ? styles.optionTextActive : styles.optionText}>{size}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Bottom Bar */}
            {document && (
                <View style={styles.bottomBar}>
                    <View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>{settings.totalPages * settings.copies} pages total</Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            {pricing.currency}{pricing.total * settings.copies}
                        </Text>
                    </View>
                    <Button mode="contained" onPress={handleProceed} style={{ paddingHorizontal: 24 }}>
                        Proceed to Pay
                    </Button>
                </View>
            )}

            <Snackbar
                visible={!!errorMsg}
                onDismiss={() => setErrorMsg(null)}
                action={{ label: 'Dismiss', onPress: () => setErrorMsg(null) }}
            >
                {errorMsg}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    content: { flex: 1, padding: 16 },
    previewSection: { alignItems: 'center', marginBottom: 16 },
    previewCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        alignItems: 'center',
        elevation: 4,
    },
    previewPage: {
        width: 120,
        height: 160,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewLandscape: {
        width: 160,
        height: 120,
    },
    settingsBadges: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 4,
    },
    pageInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    uploadBox: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E0E0E0',
        width: '100%',
    },
    settingsSection: { flex: 1 },
    tabs: { marginBottom: 16 },
    settingsGrid: { gap: 16 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 12,
    },
    optionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    optionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    optionBtnActive: {
        backgroundColor: '#FF6B35',
    },
    optionText: { color: '#666', fontWeight: '500' },
    optionTextActive: { color: 'white', fontWeight: 'bold' },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    printerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    printerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    printerIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 2,
    },
});
