import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { Text, Button, Card, useTheme, SegmentedButtons, Chip, Snackbar, ActivityIndicator, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/common/AppHeader';
import { pick, types } from '@react-native-documents/picker';
import { Skeleton } from '../../components/common/Skeleton';
import Pdf from 'react-native-pdf';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getFileType = (name: string, type?: string) => {
    if (type === 'application/pdf' || name?.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(name || '')) return 'image';
    if (/\.(doc|docx)$/i.test(name || '')) return 'doc';
    if (/\.(ppt|pptx)$/i.test(name || '')) return 'slide';
    return 'other';
};

// Backend pricing service (simulated)
const fetchPricingFromBackend = async (settings: any): Promise<{
    perPage: number;
    total: number;
    currency: string;
    isLoading?: boolean;
}> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 500));

    const pages = settings.totalPages || 10;
    const copies = settings.copies || 1;

    // Base pricing from backend
    const bwRate = 2;
    const colorRate = settings.colorMode === 'color' ? 5 : 2;

    const sideMultiplier = settings.sides === 'double' ? 0.8 : 1;

    let pageSizeMultiplier = 1;
    if (settings.pageSize === 'A3') pageSizeMultiplier = 1.5;

    const perPage = Math.round(colorRate * sideMultiplier * pageSizeMultiplier * 100) / 100;
    const total = Math.round(perPage * pages * copies);

    return { perPage, total, currency: '₹' };
};

export const DocumentUpload = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const existingDoc = route?.params?.document;
    const presetSettings = route?.params?.presetSettings;
    const initialPrinter = route?.params?.printer;

    const [document, setDocument] = useState<any>(existingDoc || null);
    const [selectedPrinter, setSelectedPrinter] = useState<any>(initialPrinter || null);
    const [activeTab, setActiveTab] = useState('basic');
    const [pricing, setPricing] = useState({ perPage: 2, total: 0, currency: '₹' });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isPricingLoading, setIsPricingLoading] = useState(false);

    // Preview Modal State
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const [settings, setSettings] = useState({
        copies: 1,
        colorMode: 'bw',
        sides: 'single',
        orientation: 'portrait',
        pageSize: 'A4',
        pagesPerSheet: 1,
        totalPages: existingDoc?.pages || 10,
        binding: false,
        ...presetSettings
    });

    const fileType = document ? getFileType(document.name, document.type) : 'other';

    // Auto-open picker if no document provided
    useEffect(() => {
        if (!existingDoc && !document && !isPickerOpen) {
            const timer = setTimeout(() => {
                handlePickDocument();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    // Update printer if returned from selection
    useEffect(() => {
        if (route?.params?.selectedPrinter) {
            setSelectedPrinter(route.params.selectedPrinter);
        }
    }, [route?.params?.selectedPrinter]);

    // Fetch pricing when settings change
    useEffect(() => {
        updatePricing();
    }, [settings]);

    const updatePricing = async () => {
        setIsPricingLoading(true);
        try {
            const price = await fetchPricingFromBackend(settings);
            setPricing(price);
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
        } finally {
            setIsPricingLoading(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings((prev: typeof settings) => ({ ...prev, [key]: value }));
    };

    const handlePickDocument = async () => {
        if (isPickerOpen) return;

        setIsPickerOpen(true);
        try {
            const result = await pick({
                type: [types.pdf, types.docx, types.doc, types.pptx, types.ppt, types.images],
            });

            if (result && result.length > 0) {
                const file = result[0];
                setDocument({
                    name: file.name || 'Document',
                    uri: file.uri,
                    type: file.type,
                    size: file.size,
                    pages: 10,
                });
                updateSetting('totalPages', 10);
            }
        } catch (e: any) {
            if (e?.code === 'DOCUMENT_PICKER_CANCELED' || e?.message?.includes('cancel')) {
                // cancelled
            } else {
                setErrorMsg('Failed to pick document. Please try again.');
            }
        } finally {
            setIsPickerOpen(false);
        }
    };

    const handleProceed = () => {
        navigation.navigate('PaymentScreen', { document, settings, pricing, printer: selectedPrinter });
    };

    return (
        <View style={styles.container}>
            <AppHeader showLogo={false} title="Document Preview" showBack={true} />

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

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Document Preview Section */}
                <View style={styles.previewSection}>
                    {document ? (
                        <View style={styles.previewCard}>
                            <View style={styles.previewContainer}>
                                {/* Preview Page Representation */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setIsPreviewVisible(true)}
                                    style={[
                                        styles.previewPage,
                                        settings.orientation === 'landscape' && styles.previewLandscape,
                                        { borderColor: theme.colors.primary, borderWidth: 2, padding: 0, overflow: 'hidden' }
                                    ]}
                                >
                                    {/* Actual Content Render */}
                                    {fileType === 'pdf' ? (
                                        <View style={{ flex: 1, width: '100%', backgroundColor: '#fff' }}>
                                            <Pdf
                                                source={{ uri: document.uri, cache: true }}
                                                style={{ flex: 1, width: '100%' }}
                                                singlePage={true}
                                                page={1}
                                                fitPolicy={0}
                                                trustAllCerts={false}
                                                onError={(error) => console.log('PDF Error:', error)}
                                            />
                                        </View>
                                    ) : fileType === 'image' ? (
                                        <Image
                                            source={{ uri: document.uri }}
                                            style={{ flex: 1, width: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#F9F9F9' }}>
                                            <Icon
                                                name={fileType === 'doc' ? 'file-word' : fileType === 'slide' ? 'file-powerpoint' : 'file-document'}
                                                size={48}
                                                color={fileType === 'doc' ? '#2B579A' : fileType === 'slide' ? '#D24726' : '#999'}
                                            />
                                            <Text variant="labelSmall" style={{ color: '#666', marginTop: 8, textAlign: 'center' }}>
                                                {fileType.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}

                                    {/* B&W Filter Overlay (Basic) */}
                                    {settings.colorMode === 'bw' && (fileType === 'pdf' || fileType === 'image') && (
                                        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(50,50,50,0.3)' }} />
                                    )}

                                    {/* Overlay Action Button */}
                                    <View style={styles.previewOverlayBtn}>
                                        <Icon name="fullscreen" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>

                                {/* Instruction Text */}
                                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 12, fontWeight: 'bold' }}>
                                    Tap to Preview
                                </Text>
                            </View>

                            <View style={styles.pageInfo}>
                                <View>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Pages</Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        {settings.totalPages} × {settings.copies}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Estimated Cost</Text>
                                    {isPricingLoading ? (
                                        <ActivityIndicator size="small" color={theme.colors.primary} />
                                    ) : (
                                        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                            {pricing.currency}{pricing.total}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <Button
                                compact
                                mode="text"
                                onPress={handlePickDocument}
                                style={{ marginTop: 8 }}
                                disabled={isPickerOpen}
                            >
                                Change Document
                            </Button>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadBox}
                            onPress={handlePickDocument}
                            disabled={isPickerOpen}
                        >
                            {isPickerOpen ? (
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                            ) : (
                                <Icon name="file-upload-outline" size={48} color={theme.colors.primary} />
                            )}
                            <Text variant="titleMedium" style={{ marginTop: 12 }}>
                                {isPickerOpen ? 'Opening...' : 'Tap to Upload'}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>PDF, DOCX, PPT, Images</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Settings Section */}
                {document && (
                    <View style={styles.settingsSection}>
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
                                {/* Orientation */}
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

                                {/* Pages Per Sheet */}
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
            </ScrollView>

            {/* Bottom Bar */}
            {document && (
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                    <View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                            {settings.totalPages * settings.copies} pages total
                        </Text>
                        {isPricingLoading ? (
                            <Skeleton height={28} width={60} />
                        ) : (
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                {pricing.currency}{pricing.total * settings.copies}
                            </Text>
                        )}
                    </View>
                    <Button
                        mode="contained"
                        onPress={handleProceed}
                        style={{ paddingHorizontal: 24 }}
                        contentStyle={{ height: 48 }}
                        disabled={isPricingLoading}
                    >
                        Proceed to Pay
                    </Button>
                </View>
            )}

            {/* Preview Modal */}
            <Modal
                visible={isPreviewVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsPreviewVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Print Preview</Text>
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={() => setIsPreviewVisible(false)}
                            style={{ margin: 0 }}
                        />
                    </View>

                    {/* Preview Content */}
                    <View style={styles.modalContent}>
                        <View style={[
                            styles.fullPreviewPage,
                            settings.orientation === 'landscape' ? styles.fullPreviewLandscape : styles.fullPreviewPortrait
                        ]}>
                            {/* Actual Content Render for Modal */}
                            {/* Actual Content Render for Modal */}
                            {fileType === 'pdf' ? (
                                <View style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                                    <Pdf
                                        source={{ uri: document.uri, cache: true }}
                                        style={{ flex: 1, width: '100%', height: '100%' }}
                                        fitPolicy={0}
                                        page={1}
                                        trustAllCerts={false}
                                        onError={(error) => console.log('PDF Modal Error:', error)}
                                    />
                                </View>
                            ) : fileType === 'image' ? (
                                <Image
                                    source={{ uri: document.uri }}
                                    style={{ flex: 1, width: '100%', height: '100%' }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', padding: 20 }}>
                                    <Icon
                                        name={fileType === 'doc' ? 'file-word' : fileType === 'slide' ? 'file-powerpoint' : 'file-document'}
                                        size={64}
                                        color={fileType === 'doc' ? '#2B579A' : fileType === 'slide' ? '#D24726' : '#999'}
                                    />
                                    <Text variant="titleMedium" style={{ color: '#666', marginTop: 16, textAlign: 'center' }}>
                                        Preview not supported for {fileType.toUpperCase()}
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>
                                        Please rely on the document name and settings.
                                    </Text>
                                </View>
                            )}

                            {/* B&W Filter Overlay */}
                            {settings.colorMode === 'bw' && (fileType === 'pdf' || fileType === 'image') && (
                                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(50,50,50,0.3)', zIndex: 1 }} />
                            )}

                            {/* Watermark / Overlay info */}
                            <View style={styles.watermarkContainer}>
                                <Text style={styles.watermarkText}>
                                    {settings.colorMode === 'bw' ? 'Black & White' : 'Color'}
                                </Text>
                            </View>
                        </View>

                        <Text style={{ marginTop: 24, color: '#666', textAlign: 'center' }}>
                            This is a simulation of how your {settings.pageSize} document will look in {settings.orientation} mode.
                        </Text>

                        <View style={styles.previewStats}>
                            <Chip icon="file-document-outline">{settings.totalPages} Pages</Chip>
                            <Chip icon="page-layout-sidebar-right">{settings.sides === 'double' ? 'Duplex' : 'Simplex'}</Chip>
                            <Chip icon="palette-outline">{settings.colorMode === 'color' ? 'Color' : 'B&W'}</Chip>
                        </View>
                    </View>
                </View>
            </Modal>

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
    // ... existing styles ...
    settingsSection: { flex: 1 },
    tabs: { marginBottom: 16 },
    settingsGrid: { gap: 12 },
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

    // Preview Card Styles
    previewSection: { alignItems: 'center', marginBottom: 16 },
    previewCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        alignItems: 'center',
        elevation: 4,
    },
    previewContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 12,
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
        padding: 8,
    },
    previewLandscape: {
        width: 160,
        height: 120,
    },
    miniLine: {
        height: 2,
        backgroundColor: '#E0E0E0',
        borderRadius: 1,
    },
    previewOverlayBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F5F9',
        padding: 20,
    },
    fullPreviewPage: {
        backgroundColor: 'white',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    fullPreviewPortrait: {
        width: SCREEN_WIDTH * 0.7,
        height: (SCREEN_WIDTH * 0.7) * 1.414, // A4 ratio
    },
    fullPreviewLandscape: {
        width: SCREEN_WIDTH * 0.85,
        height: (SCREEN_WIDTH * 0.85) / 1.414,
    },
    simulatedContent: {
        width: '80%',
        height: '80%',
    },
    simLine: {
        height: 4,
        backgroundColor: '#E0E0E0',
        marginBottom: 8,
        borderRadius: 2,
    },
    watermarkContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        opacity: 0.3,
    },
    watermarkText: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#E0E0E0',
        transform: [{ rotate: '-45deg' }],
    },
    previewStats: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 20,
    }
});
