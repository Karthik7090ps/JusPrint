import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/common/AppHeader';
import { PrintStatusWidget } from '../../components/printing/PrintStatusWidget';
import { printerService } from '../../services/printerService';
import { getSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PrintDashboard = ({ navigation, route }: { navigation: any; route: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const activeJob = useSelector((state: RootState) => state.print?.activeJob);
  const user = useSelector((state: RootState) => state.auth);

  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [recentPrints, setRecentPrints] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, monthlyAmount: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (route.params?.selectedPrinter) {
      setSelectedPrinter(route.params.selectedPrinter);
    }
  }, [route.params?.selectedPrinter]);

  const loadDashboardData = async () => {
    try {
      const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // 1. Fetch Stats (Independent)
      try {
        const statsRes = await printerService.getPrintStats(token || undefined);
        if (statsRes.success && statsRes.stats) {
          setStats({
            today: statsRes.stats.today_count || statsRes.stats.today || 0,
            week: statsRes.stats.week_count || statsRes.stats.week || 0,
            monthlyAmount: statsRes.stats.month_amount || statsRes.stats.monthly_amount || 0
          });
        }
      } catch (e) {
        console.log('[Dashboard] Stats fetch failed (might not be implemented):', e);
      }

      // 2. Fetch Recent Prints (Independent)
      try {
        const historyRes = await printerService.getPrintHistory(5, 0, token || undefined);
        if (historyRes.success) {
          console.log('[Dashboard] Raw History:', JSON.stringify(historyRes.jobs, null, 2));
          
          const mappedJobs = (historyRes.jobs || []).map((job: any) => {
            // Smart page count detection with nested checks
            let pageCount = 
              job.total_pages || 
              job.pages || 
              job.num_pages || 
              job.page_count || 
              job.settings?.total_pages || 
              job.settings?.pages ||
              job.options?.total_pages ||
              job.metadata?.total_pages ||
              0;
            
            // If still 0, try to parse page_range
            if (!pageCount && (job.page_range || job.settings?.page_range)) {
              try {
                const range = (job.page_range || job.settings?.page_range).toString();
                const parts = range.split(',');
                let calc = 0;
                parts.forEach((p: string) => {
                  if (p.includes('-')) {
                    const [start, end] = p.split('-').map(Number);
                    calc += (end - start + 1);
                  } else {
                    calc += 1;
                  }
                });
                if (calc > 0) pageCount = calc;
              } catch (e) { /* ignore parse error */ }
            }

            return {
              ...job,
              id: job.id || job.job_id,
              name: job.document_name || job.name || 'Document',
              pages: pageCount || 0,
              date: job.created_at || job.date || 'Recent'
            };
          });
          setRecentPrints(mappedJobs);
        }
      } catch (e) {
        console.log('[Dashboard] History fetch failed:', e);
      }
      
      // 3. Set Default Printer if none selected (Independent)
      if (!selectedPrinter && user.campusCode) {
        try {
          // Use campusCode from user (auth state) as required by new API
          const printersRes = await printerService.getPrintersByCampus(user.campusCode);
          if (printersRes.success && printersRes.printers && printersRes.printers.length > 0) {
            setSelectedPrinter(printersRes.printers[0]);
          }
        } catch (e) {
          console.log('[Dashboard] Default printer fetch failed:', e);
        }
      }
    } catch (error) {
      console.error('Dashboard load system error:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader showLogo={true} subtitle="Campus Printing Service" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Hero Upload Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('DocumentUpload', { selectedPrinter })}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadGradient}
            >
              <View style={styles.uploadIcon}>
                <Icon name="file-upload" size={28} color="white" />
              </View>
              <View style={styles.uploadTextBlock}>
                <Text style={styles.uploadMainText}>Upload Document</Text>
                <Text style={styles.uploadSubText}>PDF, Word, PowerPoint supported</Text>
              </View>
              <Icon name="arrow-right" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Printer Status Bar */}
          <View style={styles.printerBar}>
            <View style={styles.printerBarLeft}>
              <View style={styles.printerIconBox}>
                <Icon name="printer-check" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.printerBarTitle}>{selectedPrinter?.location || 'Select Printer'}</Text>
                <View style={styles.printerBarMeta}>
                  <View style={[styles.onlineDot, { 
                    backgroundColor: selectedPrinter?.status?.status === 'online' ? colors.success : colors.error 
                  }]} />
                  <Text style={styles.printerBarStatus}>
                    {selectedPrinter?.status?.queue_count || 0} in queue
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeLink}
              onPress={() => navigation.navigate('PrinterSelection', { returnRoute: 'Print' })}
            >
              <Text style={styles.changeLinkText}>Change</Text>
              <Icon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="calendar-today" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>Prints Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.success + '15' }]}>
              <Icon name="file-check" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.accent + '15' }]}>
              <Icon name="currency-inr" size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>₹{stats.monthlyAmount}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Pro Tip */}
        <View style={styles.tipSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipLeft}>
              <View style={styles.tipIconBox}>
                <Icon name="lightbulb-on-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.tipTextBox}>
                <Text style={styles.tipTitle}>Save with Duplex Printing</Text>
                <Text style={styles.tipSubtitle}>Print both sides • Get 20% off</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobStatus')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentPrints.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="printer-off-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No recent prints</Text>
              <Text style={styles.emptySubtext}>Start printing your documents</Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentPrints.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.recentCard,
                    index === recentPrints.length - 1 && styles.recentCardLast
                  ]}
                  onPress={() => navigation.navigate('DocumentUpload', { document: item })}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentCardLeft}>
                    <View style={[
                      styles.fileIconBox,
                      { backgroundColor: item.name.includes('.pdf') ? '#FFEBEE' : '#E3F2FD' }
                    ]}>
                      <Icon
                        name={item.name.includes('.pdf') ? 'file-pdf-box' : 'file-document-outline'}
                        size={24}
                        color={item.name.includes('.pdf') ? '#E74C3C' : '#2196F3'}
                      />
                    </View>
                    <View style={styles.recentCardInfo}>
                      <Text style={styles.recentCardName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.recentCardMeta}>
                        <Icon name="file-outline" size={12} color={colors.textTertiary} />
                        <Text style={styles.recentCardPages}>{item.pages} pages</Text>
                        <Text style={styles.recentCardDot}>•</Text>
                        <Text style={styles.recentCardDate}>{item.date}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.reprintButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('DocumentUpload', { document: item, reprint: true });
                    }}
                  >
                    <Icon name="refresh" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Help & Support */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpCard} activeOpacity={0.7}>
            <Icon name="help-circle-outline" size={24} color={colors.textSecondary} />
            <View style={styles.helpTextBox}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpSubtitle}>Check FAQs or contact support</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {activeJob && <PrintStatusWidget navigation={navigation} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Hero Upload
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  uploadButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    marginBottom: 16,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 14,
  },
  uploadIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  uploadTextBlock: {
    flex: 1,
  },
  uploadMainText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  uploadSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },

  // Printer Bar
  printerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  printerBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  printerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  printerBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  printerBarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  printerBarStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  changeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Stats
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Tip
  tipSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTextBox: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Recent Activity
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  recentList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  recentCardLast: {
    borderBottomWidth: 0,
  },
  recentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recentCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentCardPages: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentCardDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  recentCardDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  reprintButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Help
  helpSection: {
    paddingHorizontal: 20,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  helpTextBox: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
