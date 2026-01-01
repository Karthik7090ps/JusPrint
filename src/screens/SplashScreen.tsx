import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, StatusBar, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SplashScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';


export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(10);


  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));


  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));


  useEffect(() => {
    // Main logo animation - faster
    opacity.value = withTiming(1, { 
      duration: 500,  // Reduced from 800ms
      easing: Easing.out(Easing.quad)
    });
    scale.value = withTiming(1, { 
      duration: 500,  // Reduced from 800ms
      easing: Easing.out(Easing.quad)
    });


    // Tagline animation with shorter delay
    taglineOpacity.value = withDelay(250, withTiming(1, {  // Reduced from 400ms delay
      duration: 400,  // Reduced from 600ms
      easing: Easing.out(Easing.quad)
    }));
    taglineTranslateY.value = withDelay(250, withTiming(0, {  // Reduced from 400ms delay
      duration: 400,  // Reduced from 600ms
      easing: Easing.out(Easing.quad)
    }));


    // Navigate when animations are done AND auth check is complete
    const checkAndNavigate = () => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      }
    };


    const timer = setTimeout(checkAndNavigate, 1500);  // Reduced from 2500ms


    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Text style={styles.logoText}>JUS PRINT</Text>
        </Animated.View>
        
        <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
          <View style={styles.divider} />
          <Text style={styles.taglineText}>BY ASYNC LABS</Text>
        </Animated.View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.textInverse,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.textInverse + '99', // 60% opacity
    marginBottom: 12,
    borderRadius: 1,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse + 'D9', // 85% opacity
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
