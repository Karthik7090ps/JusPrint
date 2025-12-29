import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const { height, width } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector(state => state.auth);

  // Printer animations
  const printerOpacity = useSharedValue(1);
  const printerY = useSharedValue(0);
  const printerScale = useSharedValue(1);
  
  const paperY = useSharedValue(-120);
  const paperOpacity = useSharedValue(0);
  
  const printHeadX = useSharedValue(-60);
  const printHeadOpacity = useSharedValue(0);
  
  const line1Width = useSharedValue(0);
  const line2Width = useSharedValue(0);
  const line3Width = useSharedValue(0);
  
  const printedPaperY = useSharedValue(-15);
  const printedPaperOpacity = useSharedValue(0);
  
  const progressWidth = useSharedValue(0);
  
  // Paper zoom-in phase
  const paperZoomScale = useSharedValue(1);
  const paperZoomY = useSharedValue(0);
  const paperZoomOpacity = useSharedValue(0);
  
  // Letter K pop-out
  const letterKScale = useSharedValue(0);
  const letterKOpacity = useSharedValue(0);
  
  // Logo box transformation
  const logoBoxScale = useSharedValue(0);
  const logoBoxOpacity = useSharedValue(0);
  
  // Brand reveal
  const brandTextOpacity = useSharedValue(0);
  const brandTextY = useSharedValue(30);

  const printerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: printerY.value },
      { scale: printerScale.value }
    ],
    opacity: printerOpacity.value,
  }));

  const paperStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: paperY.value }],
    opacity: paperOpacity.value,
  }));

  const printHeadStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: printHeadX.value }],
    opacity: printHeadOpacity.value,
  }));

  const line1Style = useAnimatedStyle(() => ({ width: line1Width.value }));
  const line2Style = useAnimatedStyle(() => ({ width: line2Width.value }));
  const line3Style = useAnimatedStyle(() => ({ width: line3Width.value }));

  const printedPaperStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: printedPaperY.value }],
    opacity: printedPaperOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const paperZoomStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: paperZoomScale.value },
      { translateY: paperZoomY.value }
    ],
    opacity: paperZoomOpacity.value,
  }));

  const letterKStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterKScale.value }],
    opacity: letterKOpacity.value,
  }));

  const logoBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoBoxScale.value }],
    opacity: logoBoxOpacity.value,
  }));

  const brandTextStyle = useAnimatedStyle(() => ({
    opacity: brandTextOpacity.value,
    transform: [{ translateY: brandTextY.value }],
  }));

  useEffect(() => {
    // Phase 1: Printer appears (0-600ms)
    printerOpacity.value = withTiming(1, { duration: 400 });
    printerScale.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });

    // Phase 2: Paper loads (700-1500ms)
    setTimeout(() => {
      paperOpacity.value = withTiming(1, { duration: 250 });
      paperY.value = withTiming(30, { 
        duration: 800, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
    }, 700);

    // Phase 3: Printing begins (1600-3600ms)
    setTimeout(() => {
      printHeadOpacity.value = withTiming(1, { duration: 150 });
      
      printHeadX.value = withRepeat(
        withSequence(
          withTiming(60, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(-60, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        4,
        false
      );
      
      progressWidth.value = withTiming(100, { 
        duration: 2000,
        easing: Easing.linear
      });
      
      // Print lines appear with K letter visible
      setTimeout(() => line1Width.value = withTiming(65, { duration: 300 }), 200);
      setTimeout(() => line2Width.value = withTiming(75, { duration: 300 }), 550);
      setTimeout(() => line3Width.value = withTiming(60, { duration: 300 }), 900);
    }, 1600);

    // Phase 4: Paper ejects (3700-4400ms)
    setTimeout(() => {
      paperOpacity.value = withTiming(0, { duration: 250 });
      printHeadOpacity.value = withTiming(0, { duration: 150 });
      printedPaperOpacity.value = withTiming(1, { duration: 250 });
      printedPaperY.value = withTiming(70, { 
        duration: 700,
        easing: Easing.out(Easing.cubic)
      });
    }, 3700);

    // Phase 5: Printer slides away (4500-5300ms)
    setTimeout(() => {
      printerY.value = withTiming(-height, { 
        duration: 800,
        easing: Easing.in(Easing.cubic)
      });
      printerOpacity.value = withTiming(0, { duration: 600 });
    }, 4500);

    // Phase 6: Paper zooms in center (4700-5500ms)
    setTimeout(() => {
      paperZoomOpacity.value = withTiming(1, { duration: 300 });
      paperZoomScale.value = withTiming(2.5, { 
        duration: 800,
        easing: Easing.out(Easing.cubic)
      });
      paperZoomY.value = withTiming(-50, { duration: 800 });
    }, 4700);

    // Phase 7: Letter K pops out from paper (5600-6200ms)
    setTimeout(() => {
      letterKOpacity.value = withTiming(1, { duration: 200 });
      letterKScale.value = withTiming(1, { 
        duration: 600,
        easing: Easing.out(Easing.back(1.5))
      });
      
      // Paper fades out
      setTimeout(() => {
        paperZoomOpacity.value = withTiming(0, { duration: 400 });
      }, 400);
    }, 5600);

    // Phase 8: K transforms into logo box (6300-7000ms)
    setTimeout(() => {
      letterKOpacity.value = withTiming(0, { duration: 300 });
      logoBoxOpacity.value = withTiming(1, { duration: 400 });
      logoBoxScale.value = withTiming(1, { 
        duration: 600,
        easing: Easing.out(Easing.back(1.2))
      });
    }, 6300);

    // Phase 9: Brand text reveals (7100-7700ms)
    setTimeout(() => {
      brandTextOpacity.value = withTiming(1, { duration: 500 });
      brandTextY.value = withTiming(0, { 
        duration: 600,
        easing: Easing.out(Easing.cubic)
      });
    }, 7100);

  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#FAFAFA', '#FFFFFF', '#F5F5F5']}
        style={StyleSheet.absoluteFill}
      />

      {/* Phase 1-5: Printer Animation */}
      <Animated.View style={[styles.printerContainer, printerStyle]}>
        
        {/* Printer Top */}
        <View style={styles.printerTop}>
          <View style={styles.controlPanel}>
            <View style={styles.statusLed} />
            <View style={styles.displayScreen}>
              <View style={styles.displayContent}>
                <Text style={styles.displayBrand}>KORA</Text>
                <Text style={styles.displayTagline}>Campus Print</Text>
              </View>
            </View>
            <View style={styles.buttonGroup}>
              <View style={[styles.button, styles.buttonPrimary]} />
              <View style={styles.button} />
            </View>
          </View>
        </View>

        {/* Printer Body */}
        <View style={styles.printerBody}>
          
          <View style={styles.paperInput}>
            <View style={styles.inputGuides}>
              <View style={styles.guide} />
              <View style={styles.guide} />
            </View>
          </View>

          {/* Loading Paper - More Visible */}
          <Animated.View style={[styles.loadingPaper, paperStyle]}>
            <View style={styles.paperShadow} />
            <View style={styles.paperSheet}>
              <View style={styles.paperHeader}>
                <Text style={styles.paperLogo}>K</Text>
              </View>
              <View style={styles.printArea}>
                <Animated.View style={[styles.textLine, line1Style]} />
                <Animated.View style={[styles.textLine, line2Style]} />
                <Animated.View style={[styles.textLine, line3Style]} />
              </View>
            </View>
          </Animated.View>

          {/* Print Head */}
          <View style={styles.printZone}>
            <Animated.View style={[styles.printHead, printHeadStyle]}>
              <LinearGradient
                colors={['#3A3A3A', '#2A2A2A', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.printHeadBody}
              >
                <View style={styles.cartridgeHolder}>
                  <View style={[styles.inkCartridge, { backgroundColor: '#00B8D4' }]} />
                  <View style={[styles.inkCartridge, { backgroundColor: '#E91E63' }]} />
                  <View style={[styles.inkCartridge, { backgroundColor: '#FFEB3B' }]} />
                  <View style={[styles.inkCartridge, { backgroundColor: '#212121' }]} />
                </View>
                
                <View style={styles.nozzleArray}>
                  {[...Array(12)].map((_, i) => (
                    <View key={i} style={styles.nozzle} />
                  ))}
                </View>
                
                <View style={styles.sensorLed} />
              </LinearGradient>
              
              <View style={styles.railGuide} />
            </Animated.View>
          </View>

          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
          </View>

          <View style={styles.printerBrand}>
            <View style={styles.brandMark} />
          </View>
        </View>

        <View style={styles.printerBase}>
          <View style={styles.ventilation}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.ventSlot} />
            ))}
          </View>
        </View>

        {/* Output Tray with Printed Paper */}
        <View style={styles.outputTray}>
          <View style={styles.trayBase} />
          <Animated.View style={[styles.outputPaper, printedPaperStyle]}>
            <View style={styles.paperSheet}>
              <View style={styles.paperHeader}>
                <Text style={styles.paperLogo}>K</Text>
              </View>
              <View style={styles.printArea}>
                <View style={[styles.textLine, { width: 65 }]} />
                <View style={[styles.textLine, { width: 75 }]} />
                <View style={[styles.textLine, { width: 60 }]} />
              </View>
            </View>
          </Animated.View>
        </View>

      </Animated.View>

      {/* Phase 6: Zoomed Paper */}
      <Animated.View style={[styles.zoomedPaperContainer, paperZoomStyle]}>
        <View style={styles.zoomedPaper}>
          <View style={styles.paperHeader}>
            <Text style={styles.zoomedPaperLogo}>K</Text>
          </View>
          <View style={styles.printArea}>
            <View style={[styles.textLine, { width: 65 }]} />
            <View style={[styles.textLine, { width: 75 }]} />
            <View style={[styles.textLine, { width: 60 }]} />
          </View>
        </View>
      </Animated.View>

      {/* Phase 7: Letter K Pop-out */}
      <Animated.View style={[styles.letterKContainer, letterKStyle]}>
        <Text style={styles.letterK}>K</Text>
      </Animated.View>

      {/* Phase 8: Logo Box */}
      <Animated.View style={[styles.logoBoxContainer, logoBoxStyle]}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <Text style={styles.logoBoxText}>K</Text>
        </LinearGradient>
      </Animated.View>

      {/* Phase 9: Brand Text */}
      <Animated.View style={[styles.brandTextContainer, brandTextStyle]}>
        <Text style={styles.appTitle}>Kora</Text>
        <View style={styles.divider} />
        <Text style={styles.appTagline}>Campus Printing Simplified</Text>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>AsyncLabs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  printerContainer: {
    position: 'absolute',
    top: height * 0.25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // Printer styles (same as before)
  printerTop: {
    width: 200,
    height: 50,
    backgroundColor: '#2C2C2C',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  controlPanel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  displayScreen: {
    flex: 1,
    height: 28,
    backgroundColor: '#A8E6CF',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  displayContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  displayBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A4D2E',
    letterSpacing: 1.2,
  },
  displayTagline: {
    fontSize: 8,
    fontWeight: '600',
    color: '#2D5F3F',
    letterSpacing: 0.3,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    width: 16,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  buttonPrimary: {
    backgroundColor: '#666',
  },

  printerBody: {
    width: 200,
    height: 145,
    backgroundColor: '#F8F8F8',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
  },

  paperInput: {
    width: 100,
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGuides: {
    flexDirection: 'row',
    gap: 40,
  },
  guide: {
    width: 2,
    height: 6,
    backgroundColor: '#CCC',
  },

  // Enhanced Paper - More Visible
  loadingPaper: {
    position: 'absolute',
    top: -25,
    alignItems: 'center',
  },
  paperShadow: {
    position: 'absolute',
    width: 92,
    height: 120,
    backgroundColor: '#000',
    opacity: 0.15,
    borderRadius: 3,
    top: 4,
    left: 2,
  },
  paperSheet: {
    width: 90,
    height: 120,
    backgroundColor: '#FEFEFE',
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    padding: 12,
  },
  paperHeader: {
    marginBottom: 10,
  },
  paperLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  printArea: {
    gap: 9,
  },
  textLine: {
    height: 3,
    backgroundColor: '#1A1A1A',
    borderRadius: 1.5,
  },

  printZone: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  printHead: {
    position: 'absolute',
    alignItems: 'center',
  },
  printHeadBody: {
    width: 85,
    height: 14,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: '#0A0A0A',
  },
  cartridgeHolder: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    marginBottom: 2,
  },
  inkCartridge: {
    width: 14,
    height: 4,
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  nozzleArray: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
  },
  nozzle: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#4A4A4A',
  },
  sensorLed: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  railGuide: {
    width: 100,
    height: 2,
    backgroundColor: '#D0D0D0',
    borderRadius: 1,
    marginTop: 3,
  },

  progressArea: {
    width: 140,
    marginTop: 20,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 1.5,
  },

  printerBrand: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  brandMark: {
    width: 20,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 1,
  },

  printerBase: {
    width: 210,
    height: 16,
    backgroundColor: '#3A3A3A',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  ventilation: {
    flexDirection: 'row',
    gap: 4,
  },
  ventSlot: {
    width: 18,
    height: 2,
    backgroundColor: '#2A2A2A',
    borderRadius: 1,
  },

  outputTray: {
    width: 110,
    height: 60,
    marginTop: 8,
    alignItems: 'center',
  },
  trayBase: {
    width: 100,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
  },
  outputPaper: {
    marginTop: 4,
  },

  // Zoomed Paper
  zoomedPaperContainer: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.5,
    marginLeft: -45,
    marginTop: -60,
  },
  zoomedPaper: {
    width: 90,
    height: 120,
    backgroundColor: '#FEFEFE',
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    padding: 12,
  },
  zoomedPaperLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1,
  },

  // Letter K Pop-out
  letterKContainer: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.5,
    marginLeft: -50,
    marginTop: -50,
  },
  letterK: {
    fontSize: 100,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  // Logo Box
  logoBoxContainer: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.5,
    marginLeft: -40,
    marginTop: -40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoBoxText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Brand Text
  brandTextContainer: {
    position: 'absolute',
    top: height * 0.5 + 60,
    width: '100%',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 4,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 12,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    letterSpacing: 0.5,
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
});

export default SplashScreen;
