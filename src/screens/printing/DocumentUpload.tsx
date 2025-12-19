import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { Text, Button, Card, useTheme, SegmentedButtons, Chip, Snackbar, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/common/AppHeader';
import { pick, types } from '@react-native-documents/picker';
import { Skeleton } from '../../components/common/Skeleton';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { printerService, Printer } from '../../services/printerService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getFileType = (name: string, type?: string) => {
    if (type === 'application/pdf' || name?.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(name || '')) return 'image';
    if (/\.(doc|docx)$/i.test(name || '')) return 'doc';
    if (/\.(ppt|pptx)$/i.test(name || '')) return 'slide';
    return 'other';
};

// Utility to calculate real pricing based on printer config
const calculateRealPrice = (settings: any, printer: Printer | null) => {
    if (!settings?.totalPages || settings.totalPages === 0) {
        return { perPage: 0, total: 0, breakdown: [] };
    }

    const pages = settings.totalPages;
    const copies = settings.copies || 1;
    let rate = 0;
    let type = '';

    if (printer?.pricing) {
        if (settings.colorMode === 'color') {
            rate = settings.sides === 'double' ? printer.pricing.price_color_duplex : printer.pricing.price_color_single;
            type = `Color (${settings.sides === 'double' ? 'Duplex' : 'Simplex'})`;
        } else {
            rate = settings.sides === 'double' ? printer.pricing.price_bw_duplex : printer.pricing.price_bw_single;
            type = `B&W (${settings.sides === 'double' ? 'Duplex' : 'Simplex'})`;
        }
    } else {
        // Fallback to demo pricing
        rate = settings.colorMode === 'color' ? 5 : 2;
        if (settings.sides === 'double') rate *= 0.8;
        type = 'Standard Rate';
    }

    const total = Math.round(rate * pages * copies * 100) / 100;

    const breakdown = [
        { label: 'Print Mode', value: type },
        { label: 'Unit Rate', value: `₹${rate.toFixed(2)}` },
        { label: 'Pages', value: `${pages} ${pages === 1 ? 'page' : 'pages'}` }
    ];

    if (copies > 1) {
        breakdown.push({ label: 'Copies', value: `× ${copies}` });
    }

    return {
        perPage: rate,
        total,
        currency: '₹',
        breakdown
    };
};

export const DocumentUpload = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const existingDoc = route?.params?.document;
    const presetSettings = route?.params?.presetSettings;
    const initialPrinter = route?.params?.selectedPrinter;

    const [document, setDocument] = useState<any>(existingDoc || null);
    const [selectedPrinter, setSelectedPrinter] = useState<any>(initialPrinter || null);
    const [printerDetails, setPrinterDetails] = useState<Printer | null>(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [pricing, setPricing] = useState<any>({ perPage: 2, total: 0, currency: '₹', breakdown: [] });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isPricingLoading, setIsPricingLoading] = useState(false);
    const [isPrinterLoading, setIsPrinterLoading] = useState(false);
    const [isDetectingPages, setIsDetectingPages] = useState(false);

    // Preview Modal State
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const [settings, setSettings] = useState({
        copies: 1,
        colorMode: 'bw',
        sides: 'single',
        orientation: 'portrait',
        pageSize: 'A4',
        pagesPerSheet: 1,
        totalPages: existingDoc?.pages || 0,
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

    // Update pricing when settings or printer details change
    useEffect(() => {
        const result = calculateRealPrice(settings, printerDetails);
        setPricing(result);
    }, [settings, printerDetails]);

    // Fetch full printer details when selected printer changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (selectedPrinter?.id) {
                setIsPrinterLoading(true);
                const res = await printerService.getPrinterDetails(selectedPrinter.id);
                if (res.success && res.printer) {
                    setPrinterDetails(res.printer);

                    const { capabilities } = res.printer;
                    if (!capabilities.supports_color && settings.colorMode === 'color') {
                        updateSetting('colorMode', 'bw');
                    }
                    if (!capabilities.supports_duplex && settings.sides === 'double') {
                        updateSetting('sides', 'single');
                    }
                }
                setIsPrinterLoading(false);
            }
        };
        fetchDetails();
    }, [selectedPrinter?.id]);

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

                // Copy to cache to resolve permission issues
                let fileUri = file.uri;
                if (fileUri.startsWith('content://')) {
                    const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${file.name}`;
                    await ReactNativeBlobUtil.fs.cp(fileUri, cachePath);
                    fileUri = `file://${cachePath}`;
                }

                setDocument({
                    name: file.name || 'Document',
                    uri: fileUri,
                    type: file.type,
                    size: file.size,
                    pages: 0,
                });
                // Reset pages and start detection
                updateSetting('totalPages', 0);
                const docType = getFileType(file.name || '', file.type || '');
                if (docType === 'pdf') {
                    setIsDetectingPages(true);
                } else if (docType === 'image') {
                    updateSetting('totalPages', 1);
                }
            }
        } catch (e: any) {
            if (e?.code === 'DOCUMENT_PICKER_CANCELED' || e?.message?.includes('cancel')) {
                // cancelled
            } else {
                console.error('Picker Error:', e);
                setErrorMsg('Failed to pick document. Please try again.');
            }
        } finally {
            setIsPickerOpen(false);
        }
    };

    const handleProceed = () => {
        if (!document) {
            setErrorMsg('Please select a document first');
            return;
        }
        if (isDetectingPages) {
            setErrorMsg('Calculating page count... Please wait');
            return;
        }
        navigation.navigate('PaymentScreen', {
            document,
            settings,
            pricing: selectedPrinter?.pricing || pricing,
            printerId: selectedPrinter?.id,
            printerName: selectedPrinter?.name || selectedPrinter?.location
        });
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
                        {isPrinterLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Icon name="printer" size={20} color={theme.colors.primary} />
                        )}
                    </View>
                    <View>
                        <Text variant="labelSmall" style={{ color: '#666' }}>Printing to</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#1A1A2E' }}>
                            {isPrinterLoading ? 'Fetching details...' : (selectedPrinter?.location || 'Select Printer')}
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
                                                onLoadComplete={(numberOfPages) => {
                                                    console.log('Main Preview: PDF detected:', numberOfPages);
                                                    if (numberOfPages > 0) {
                                                        updateSetting('totalPages', numberOfPages);
                                                        setIsDetectingPages(false);
                                                    }
                                                }}
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
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Pages to Print</Text>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        {isDetectingPages ? 'Detecting...' : settings.totalPages || (fileType === 'pdf' ? '...' : '1')} {settings.totalPages === 1 ? 'page' : 'pages'}
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
                        {/* Premium Tab Selector */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'basic' && styles.tabItemActive]}
                                onPress={() => setActiveTab('basic')}
                            >
                                <Icon name="tune-variant" size={20} color={activeTab === 'basic' ? 'white' : '#666'} />
                                <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Basic Config</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'advanced' && styles.tabItemActive]}
                                onPress={() => setActiveTab('advanced')}
                            >
                                <Icon name="plus-circle-outline" size={20} color={activeTab === 'advanced' ? 'white' : '#666'} />
                                <Text style={[styles.tabText, activeTab === 'advanced' && styles.tabTextActive]}>Advanced</Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'basic' ? (
                            <View style={styles.settingsGrid}>
                                {/* Color Mode Card */}
                                <View style={styles.settingCard}>
                                    <View style={styles.settingHeader}>
                                        <View style={[styles.cardIconBox, { backgroundColor: '#E3F2FD' }]}>
                                            <Icon name="palette-outline" size={22} color="#1976D2" />
                                        </View>
                                        <View>
                                            <Text variant="titleMedium" style={styles.cardTitle}>Color Mode</Text>
                                            <Text variant="bodySmall" style={styles.cardSubtitle}>Select printing color</Text>
                                        </View>
                                    </View>
                                    <View style={styles.optionRow}>
                                        <TouchableOpacity
                                            style={[styles.tile, settings.colorMode === 'bw' && styles.tileActive]}
                                            onPress={() => updateSetting('colorMode', 'bw')}
                                        >
                                            <Icon name="circle-half-full" size={20} color={settings.colorMode === 'bw' ? 'white' : '#666'} />
                                            <Text style={[styles.tileText, settings.colorMode === 'bw' && styles.tileTextActive]}>Black & White</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.tile,
                                                settings.colorMode === 'color' && styles.tileActive,
                                                printerDetails && !printerDetails.capabilities.supports_color && { opacity: 0.4 }
                                            ]}
                                            onPress={() => {
                                                if (printerDetails && !printerDetails.capabilities.supports_color) {
                                                    setErrorMsg('This printer does not support color printing');
                                                    return;
                                                }
                                                updateSetting('colorMode', 'color');
                                            }}
                                        >
                                            <Icon name="palette" size={20} color={settings.colorMode === 'color' ? 'white' : '#666'} />
                                            <View>
                                                <Text style={[styles.tileText, settings.colorMode === 'color' && styles.tileTextActive]}>Full Color</Text>
                                                {printerDetails && !printerDetails.capabilities.supports_color && (
                                                    <Text style={{ fontSize: 8, color: '#FF5252' }}>Not Supported</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Paper Sides Card */}
                                <View style={styles.settingCard}>
                                    <View style={styles.settingHeader}>
                                        <View style={[styles.cardIconBox, { backgroundColor: '#F3E5F5' }]}>
                                            <Icon name="book-open-outline" size={22} color="#9C27B0" />
                                        </View>
                                        <View>
                                            <Text variant="titleMedium" style={styles.cardTitle}>Print Sides</Text>
                                            <Text variant="bodySmall" style={styles.cardSubtitle}>Single or Double sided</Text>
                                        </View>
                                    </View>
                                    <View style={styles.optionRow}>
                                        <TouchableOpacity
                                            style={[styles.tile, settings.sides === 'single' && styles.tileActive]}
                                            onPress={() => updateSetting('sides', 'single')}
                                        >
                                            <Icon name="file-outline" size={20} color={settings.sides === 'single' ? 'white' : '#666'} />
                                            <Text style={[styles.tileText, settings.sides === 'single' && styles.tileTextActive]}>One Side</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.tile,
                                                settings.sides === 'double' && styles.tileActive,
                                                printerDetails && !printerDetails.capabilities.supports_duplex && { opacity: 0.4 }
                                            ]}
                                            onPress={() => {
                                                if (printerDetails && !printerDetails.capabilities.supports_duplex) {
                                                    setErrorMsg('This printer does not support double-sided printing');
                                                    return;
                                                }
                                                updateSetting('sides', 'double');
                                            }}
                                        >
                                            <Icon name="file-multiple" size={20} color={settings.sides === 'double' ? 'white' : '#666'} />
                                            <View>
                                                <Text style={[styles.tileText, settings.sides === 'double' && styles.tileTextActive]}>Both Sides</Text>
                                                {printerDetails && !printerDetails.capabilities.supports_duplex && (
                                                    <Text style={{ fontSize: 8, color: '#FF5252' }}>Not Supported</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    {settings.sides === 'double' && (
                                        <Text variant="labelSmall" style={styles.discountTag}>✨ Optimized Duplex rate applied!</Text>
                                    )}
                                </View>

                                {/* Copies Stepper */}
                                <View style={styles.settingCard}>
                                    <View style={styles.settingHeader}>
                                        <View style={[styles.cardIconBox, { backgroundColor: '#FFF3E0' }]}>
                                            <Icon name="content-copy" size={22} color="#EF6C00" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleMedium" style={styles.cardTitle}>Copies</Text>
                                            <Text variant="bodySmall" style={styles.cardSubtitle}>Number of print sets</Text>
                                        </View>
                                        <View style={styles.stepperContainer}>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => updateSetting('copies', Math.max(1, settings.copies - 1))}
                                            >
                                                <Icon name="minus" size={20} color="#666" />
                                            </TouchableOpacity>
                                            <Text variant="titleLarge" style={styles.stepValue}>{settings.copies}</Text>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => updateSetting('copies', settings.copies + 1)}
                                            >
                                                <Icon name="plus" size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Pages Stepper (Manual Override) */}
                                <View style={styles.settingCard}>
                                    <View style={styles.settingHeader}>
                                        <View style={[styles.cardIconBox, { backgroundColor: '#E0F2F1' }]}>
                                            <Icon name="file-document-multiple-outline" size={22} color="#00796B" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="titleMedium" style={styles.cardTitle}>Total Pages</Text>
                                            <Text variant="bodySmall" style={styles.cardSubtitle}>
                                                {fileType === 'pdf' ? 'Auto-detected from PDF' : 'Adjust if needed'}
                                            </Text>
                                        </View>
                                        <View style={styles.stepperContainer}>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => updateSetting('totalPages', Math.max(1, settings.totalPages - 1))}
                                            >
                                                <Icon name="minus" size={20} color="#666" />
                                            </TouchableOpacity>
                                            <Text variant="titleLarge" style={styles.stepValue}>{settings.totalPages}</Text>
                                            <TouchableOpacity
                                                style={styles.stepBtn}
                                                onPress={() => updateSetting('totalPages', settings.totalPages + 1)}
                                            >
                                                <Icon name="plus" size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.settingsGrid}>
                                {/* Layout Orientation */}
                                <View style={styles.settingCard}>
                                    <Text variant="labelSmall" style={styles.compactLabel}>PAGE ORIENTATION</Text>
                                    <View style={styles.optionRow}>
                                        <TouchableOpacity
                                            style={[styles.compactTile, settings.orientation === 'portrait' && styles.tileActive]}
                                            onPress={() => updateSetting('orientation', 'portrait')}
                                        >
                                            <Icon name="crop-portrait" size={18} color={settings.orientation === 'portrait' ? 'white' : '#666'} />
                                            <Text style={[styles.compactTileText, settings.orientation === 'portrait' && styles.tileTextActive]}>Portrait</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.compactTile, settings.orientation === 'landscape' && styles.tileActive]}
                                            onPress={() => updateSetting('orientation', 'landscape')}
                                        >
                                            <Icon name="crop-landscape" size={18} color={settings.orientation === 'landscape' ? 'white' : '#666'} />
                                            <Text style={[styles.compactTileText, settings.orientation === 'landscape' && styles.tileTextActive]}>Landscape</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Paper Size */}
                                <View style={styles.settingCard}>
                                    <Text variant="labelSmall" style={styles.compactLabel}>PAPER SIZE</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollOptions}>
                                        {['A4', 'A3', 'A5', 'Letter', 'Legal'].map(size => (
                                            <TouchableOpacity
                                                key={size}
                                                style={[styles.sizeTile, settings.pageSize === size && styles.activeSizeTile]}
                                                onPress={() => updateSetting('pageSize', size)}
                                            >
                                                <Text style={[styles.sizeTileText, settings.pageSize === size && styles.activeSizeTileText]}>{size}</Text>
                                                {settings.pageSize === size && <Icon name="check-circle" size={14} color="white" style={styles.checkIcon} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Pages Per Sheet */}
                                <View style={styles.settingCard}>
                                    <Text variant="labelSmall" style={styles.compactLabel}>PAGES PER SHEET</Text>
                                    <View style={styles.optionRow}>
                                        {[1, 2, 4, 6, 9].map(n => (
                                            <TouchableOpacity
                                                key={n}
                                                style={[styles.nUpTile, settings.pagesPerSheet === n && styles.tileActive]}
                                                onPress={() => updateSetting('pagesPerSheet', n)}
                                            >
                                                <Text style={[styles.nUpText, settings.pagesPerSheet === n && styles.tileTextActive]}>{n}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Price Breakdown (Moved inside ScrollView) */}
                        {pricing.total > 0 && (
                            <View style={[styles.breakdownContainer, { backgroundColor: 'white', marginTop: 24, paddingBottom: 24 }]}>
                                <Text variant="labelSmall" style={{ color: '#888', fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }}>PRICE BREAKDOWN</Text>
                                <View>
                                    {pricing.breakdown.map((item: any, idx: number) => (
                                        <View key={idx} style={styles.breakdownRow}>
                                            <Text variant="bodySmall" style={{ color: '#666' }}>{item.label}</Text>
                                            <Text variant="bodySmall" style={{ fontWeight: 'bold', color: '#1A1A2E' }}>{item.value}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Divider style={{ marginVertical: 12 }} />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Hidden PDF Page Detector - Runs in background to ensure totalPages is always accurate */}
            {document && fileType === 'pdf' && (
                <View style={{ height: 1, width: 1, opacity: 0.01, position: 'absolute', left: -100, top: -100 }}>
                    <Pdf
                        source={{ uri: document.uri, cache: true }}
                        trustAllCerts={false}
                        fitPolicy={0}
                        onLoadComplete={(numberOfPages) => {
                            console.log('Hidden Detector: PDF pages detected:', numberOfPages);
                            if (numberOfPages > 0) {
                                updateSetting('totalPages', numberOfPages);
                                setIsDetectingPages(false);
                            }
                        }}
                        onError={(error) => {
                            console.log('Hidden Detector Error:', error);
                            setIsDetectingPages(false);
                            // Fallback to 1 if detection fails
                            if (settings.totalPages === 0) updateSetting('totalPages', 1);
                        }}
                    />
                </View>
            )}

            {/* Bottom Bar */}
            {document && (
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                    <View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>Payable Amount</Text>
                        {isPricingLoading ? (
                            <Skeleton height={28} width={60} />
                        ) : (
                            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                {pricing.currency}{pricing.total}
                            </Text>
                        )}
                    </View>
                    <Button
                        mode="contained"
                        onPress={handleProceed}
                        style={{ paddingHorizontal: 24, borderRadius: 12 }}
                        contentStyle={{ height: 48 }}
                        disabled={isPricingLoading || pricing.total === 0 || isDetectingPages}
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
                                        onLoadComplete={(numberOfPages) => {
                                            if (settings.totalPages !== numberOfPages) {
                                                updateSetting('totalPages', numberOfPages);
                                            }
                                        }}
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
    settingsSection: { marginTop: 16 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    tabItemActive: {
        backgroundColor: '#1A1A2E',
    },
    tabText: {
        fontWeight: 'bold',
        color: '#666',
        fontSize: 14,
    },
    tabTextActive: {
        color: 'white',
    },
    settingsGrid: {
        gap: 16,
    },
    settingCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    cardSubtitle: {
        color: '#888',
    },
    optionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    tile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F5F6FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    tileActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    tileText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#666',
    },
    tileTextActive: {
        color: 'white',
    },
    discountTag: {
        marginTop: 12,
        color: '#2ECC71',
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 4,
        borderRadius: 8,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6FA',
        borderRadius: 12,
        padding: 4,
    },
    stepBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    stepValue: {
        minWidth: 44,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    compactLabel: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 10,
    },
    compactTile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F5F6FA',
        gap: 6,
    },
    compactTileText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    scrollOptions: {
        gap: 8,
        paddingBottom: 4,
    },
    sizeTile: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F5F6FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minWidth: 70,
        alignItems: 'center',
        position: 'relative',
    },
    activeSizeTile: {
        backgroundColor: '#1A1A2E',
        borderColor: '#1A1A2E',
    },
    sizeTileText: {
        fontWeight: 'bold',
        color: '#666',
    },
    activeSizeTileText: {
        color: 'white',
    },
    checkIcon: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#2ECC71',
        borderRadius: 10,
    },
    nUpTile: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#F5F6FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nUpText: {
        fontWeight: 'bold',
        color: '#666',
    },
    breakdownContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // Keep internal legacy styles if needed by other components
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
