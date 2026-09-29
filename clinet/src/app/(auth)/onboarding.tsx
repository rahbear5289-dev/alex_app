import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Your Complete\nBook Store',
    description:
      'Access all Maharashtra State Board textbooks from Nursery to 12th standard — anytime, anywhere.',
    image: require('../../../assets/images/onboarding_bookstore.jpg'),
    emoji: '📚',
  },
  {
    id: '2',
    title: 'Smart Study\nNotes',
    description:
      'Subject-wise notes, key formulas, and practical logs — perfectly organized for every chapter.',
    image: require('../../../assets/images/onboarding_notes.jpg'),
    emoji: '📝',
  },
  {
    id: '3',
    title: 'AI Doubt\nSolver',
    description:
      'Ask any question and get instant, step-by-step explanations tailored to your curriculum.',
    image: require('../../../assets/images/onboarding_ai.jpg'),
    emoji: '🤖',
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const allSlidesViewed = currentIndex >= SLIDES.length - 1;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  };

  const handleGetStarted = () => {
    router.replace('/(auth)/clerk-auth');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.illustration} resizeMode="contain" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.secondary} />

      {/* Logo */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appName}>ALEX</Text>
        </View>
      </View>

      {/* Title & Description area */}
      <View style={styles.textArea}>
        <Text style={styles.slideTitle}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.slideDescription}>{SLIDES[currentIndex].description}</Text>
      </View>

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
                setCurrentIndex(index);
              }}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.getStartedBtn,
            !allSlidesViewed && styles.getStartedBtnDisabled,
          ]}
          onPress={allSlidesViewed ? handleGetStarted : handleNext}
          disabled={!allSlidesViewed}
          activeOpacity={allSlidesViewed ? 0.85 : 1}
          accessibilityLabel={allSlidesViewed ? 'Get Started' : 'Swipe to continue'}
        >
          <Text
            style={[
              styles.getStartedText,
              !allSlidesViewed && styles.getStartedTextDisabled,
            ]}
          >
            {allSlidesViewed ? 'Get Started →' : `Swipe or Next (${currentIndex + 1}/3)`}
          </Text>
        </TouchableOpacity>

        {!allSlidesViewed && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Next Slide ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  header: {
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 3,
  },
  textArea: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    minHeight: 120,
  },
  slideTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  slideDescription: {
    ...Typography.body1,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  flatList: {
    flexGrow: 0,
    height: height * 0.35,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    width: width * 0.72,
    height: height * 0.32,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '92%',
    height: '92%',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  getStartedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  getStartedText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  getStartedTextDisabled: {
    color: '#9E9E9E',
  },
  skipBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  skipText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
