import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useProfile } from '../../context/ProfileContext';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

export interface BookItem {
  id: string;
  subject: string;
  standard: string;
  stream?: 'Science' | 'Commerce' | 'Arts';
  emoji: string;
  color: string;
  tag: string;
  chapters: string[];
}

const BOOKS: BookItem[] = [
  // Pre-Primary
  { id: 'b-nur-1', subject: 'Alphabet & Rhymes', standard: 'Nursery', emoji: '🔤', color: '#FFF3E0', tag: 'Letters & Fun', chapters: ['Ch 1: English Alphabet A-Z', 'Ch 2: Nursery Rhymes', 'Ch 3: Picture Identification'] },
  { id: 'b-lkg-1', subject: 'Early Math & Shapes', standard: 'LKG', emoji: '🟡', color: '#E8F5E9', tag: 'Numbers 1-50', chapters: ['Ch 1: Counting & Numbers', 'Ch 2: Basic 2D Shapes', 'Ch 3: Color Recognition'] },
  { id: 'b-ukg-1', subject: 'General Awareness', standard: 'UKG', emoji: '🌱', color: '#E1F5FE', tag: 'World Around Us', chapters: ['Ch 1: My Family & Pets', 'Ch 2: Plants & Animals', 'Ch 3: Good Habits'] },

  // Primary (Std 1 - 5)
  { id: 'b-1-1', subject: 'Balbharati Marathi', standard: '1', emoji: '✍️', color: '#FCE4EC', tag: 'Language & Stories', chapters: ['१. सुंदर माझे घर', '२. प्राणी आणि पक्षी', '३. गाणी व कविता'] },
  { id: 'b-1-2', subject: 'Mathematics', standard: '1', emoji: '🔢', color: '#E8F5E9', tag: 'Numbers & Addition', chapters: ['Ch 1: Number concepts', 'Ch 2: Addition up to 20', 'Ch 3: Spatial senses'] },
  { id: 'b-5-1', subject: 'Environmental Studies', standard: '5', emoji: '🌍', color: '#E0F2F1', tag: 'Our Earth & Living World', chapters: ['Ch 1: Our Earth and Solar System', 'Ch 2: Motions of the Earth', 'Ch 3: The Living World'] },
  { id: 'b-5-2', subject: 'English Balbharati', standard: '5', emoji: '📖', color: '#FFF8E1', tag: 'Prose & Poetry', chapters: ['Unit 1: What a Bird Thought', 'Unit 2: Daydreams', 'Unit 3: Be a Good Host'] },

  // Secondary (Std 8 - 10)
  { id: 'b-10-1', subject: 'Mathematics Part 1', standard: '10', emoji: '📐', color: '#E8F5E9', tag: 'Algebra & Statistics', chapters: ['Ch 1: Linear Equations in Two Variables', 'Ch 2: Quadratic Equations', 'Ch 3: Arithmetic Progression', 'Ch 4: Financial Planning'] },
  { id: 'b-10-2', subject: 'Mathematics Part 2', standard: '10', emoji: '📏', color: '#E8F5E9', tag: 'Geometry & Trig', chapters: ['Ch 1: Similarity', 'Ch 2: Pythagoras Theorem', 'Ch 3: Circle', 'Ch 4: Geometric Constructions'] },
  { id: 'b-10-3', subject: 'Science & Tech 1', standard: '10', emoji: '⚡', color: '#E3F2FD', tag: 'Physics & Chemistry', chapters: ['Ch 1: Gravitation', 'Ch 2: Periodic Classification of Elements', 'Ch 3: Chemical Reactions', 'Ch 4: Effects of Electric Current'] },
  { id: 'b-10-4', subject: 'Science & Tech 2', standard: '10', emoji: '🔬', color: '#E3F2FD', tag: 'Biology & Environment', chapters: ['Ch 1: Heredity and Evolution', 'Ch 2: Life Processes in Living Organisms', 'Ch 3: Environmental Management'] },
  { id: 'b-10-5', subject: 'History & Civics', standard: '10', emoji: '🏛️', color: '#FFF8E1', tag: 'Maharashtra & World', chapters: ['Ch 1: Historiography: Development in the West', 'Ch 2: Historiography: Indian Tradition', 'Ch 3: Applied History'] },
  { id: 'b-10-6', subject: 'Geography', standard: '10', emoji: '🌏', color: '#F3E5F5', tag: 'India & Brazil', chapters: ['Ch 1: Field Visit', 'Ch 2: Location and Extent', 'Ch 3: Physiography and Drainage'] },

  // Senior Secondary (Std 11 & 12 Science)
  { id: 'b-12-s1', subject: 'Physics', standard: '12', stream: 'Science', emoji: '⚛️', color: '#E3F2FD', tag: 'Rotational & Wave Optics', chapters: ['Ch 1: Rotational Dynamics', 'Ch 2: Mechanical Properties of Fluids', 'Ch 3: Kinetic Theory of Gases', 'Ch 4: Thermodynamics'] },
  { id: 'b-12-s2', subject: 'Chemistry', standard: '12', stream: 'Science', emoji: '⚗️', color: '#F3E5F5', tag: 'Organic & Inorganic', chapters: ['Ch 1: Solid State', 'Ch 2: Solutions', 'Ch 3: Ionic Equilibria', 'Ch 4: Chemical Thermodynamics'] },
  { id: 'b-12-s3', subject: 'Biology', standard: '12', stream: 'Science', emoji: '🧬', color: '#E8F5E9', tag: 'Genetics & Physiology', chapters: ['Ch 1: Reproduction in Lower and Higher Plants', 'Ch 2: Reproduction in Animals', 'Ch 3: Inheritance and Variation'] },

  // Senior Secondary (Std 11 & 12 Commerce)
  { id: 'b-12-c1', subject: 'Book-Keeping & Accountancy', standard: '12', stream: 'Commerce', emoji: '📊', color: '#FFF8E1', tag: 'Partnership & Balance Sheet', chapters: ['Ch 1: Introduction to Partnership', 'Ch 2: Accounts of Not-for-Profit Concerns', 'Ch 3: Admission of Partner'] },
  { id: 'b-12-c2', subject: 'Economics', standard: '12', stream: 'Commerce', emoji: '💹', color: '#E0F2F1', tag: 'Micro & Macroeconomics', chapters: ['Ch 1: Introduction to Micro & Macro', 'Ch 2: Utility Analysis', 'Ch 3A: Demand Analysis', 'Ch 3B: Elasticity of Demand'] },

  // Senior Secondary (Std 11 & 12 Arts)
  { id: 'b-12-a1', subject: 'Political Science', standard: '12', stream: 'Arts', emoji: '⚖️', color: '#FBE9E7', tag: 'World & Indian Politics', chapters: ['Ch 1: The World Since 1991', 'Ch 2: Key Concepts: Globalisation', 'Ch 3: Humanitarian Issues'] },
  { id: 'b-12-a2', subject: 'Psychology', standard: '12', stream: 'Arts', emoji: '🧠', color: '#EDE7F6', tag: 'Mind & Human Behavior', chapters: ['Ch 1: Intelligence', 'Ch 2: Personality', 'Ch 3: Group Dynamics', 'Ch 4: Positive Psychology'] },
];

const CATEGORIES = [
  { id: 'algo', label: 'Algorithms', emoji: '🔄', color: '#E8F5E9', noteCategory: 'notes' },
  { id: 'formula', label: 'Formulas', emoji: '🧮', color: '#E3F2FD', noteCategory: 'formula' },
  { id: 'practical', label: 'Practicals', emoji: '🔬', color: '#FFF8E1', noteCategory: 'practical' },
  { id: 'scan', label: 'Scan Doc', emoji: '📷', color: '#FCE4EC', noteCategory: 'scan' },
];

const FILTER_STANDARDS = ['My Class', 'All', 'Nursery', '1', '5', '10', '12'];

export default function Home() {
  const { user } = useUser();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrowseStd, setSelectedBrowseStd] = useState('My Class');
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);

  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'Student';
  
  const standardLabel = profile?.standard
    ? (['Nursery', 'LKG', 'UKG'].includes(profile.standard)
        ? profile.standard
        : `Std ${profile.standard}`)
    : '';
  const streamLabel = profile?.stream ? ` — ${profile.stream}` : '';
  const profileLabel = standardLabel ? `${standardLabel}${streamLabel}` : 'Maharashtra State Board';

  // Filter books based on standard filter, search query, and profile
  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      // 1. Standard filter
      if (selectedBrowseStd === 'My Class') {
        if (profile?.standard) {
          if (book.standard !== profile.standard) return false;
          if (profile.stream && book.stream && book.stream !== profile.stream) return false;
        }
      } else if (selectedBrowseStd !== 'All') {
        if (book.standard !== selectedBrowseStd) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = book.subject.toLowerCase().includes(query);
        const matchesTag = book.tag.toLowerCase().includes(query);
        const matchesStd = book.standard.toLowerCase().includes(query);
        return matchesSubject || matchesTag || matchesStd;
      }

      return true;
    });
  }, [selectedBrowseStd, profile, searchQuery]);

  const handleCategoryPress = (cat: typeof CATEGORIES[0]) => {
    if (cat.id === 'scan') {
      router.push('/(tabs)/scan');
    } else {
      router.push({
        pathname: '/(tabs)/notes',
        params: { category: cat.noteCategory },
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good day, {firstName}! 👋</Text>
            <TouchableOpacity
              style={styles.profilePill}
              onPress={() => router.push('/(tabs)/settings')}
              activeOpacity={0.8}
            >
              <Text style={styles.profilePillText}>🎓 {profileLabel}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.8}
            accessibilityLabel="Open settings and profile"
          >
            <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search textbooks, chapters, notes…"
            placeholderTextColor="rgba(255,255,255,0.65)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search books and notes"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Access Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Study Tools</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: cat.color }]}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.8}
                accessibilityLabel={cat.label}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book Store Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Maharashtra Book Store</Text>
            <TouchableOpacity onPress={() => setSelectedBrowseStd('All')}>
              <Text style={styles.seeAll}>Browse All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Official Balbharati curriculum textbooks & study resources
          </Text>

          {/* Standard Browse Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.browseChipsRow}
          >
            {FILTER_STANDARDS.map((std) => (
              <TouchableOpacity
                key={std}
                style={[
                  styles.browseChip,
                  selectedBrowseStd === std && styles.browseChipActive,
                ]}
                onPress={() => setSelectedBrowseStd(std)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.browseChipText,
                    selectedBrowseStd === std && styles.browseChipTextActive,
                  ]}
                >
                  {std === 'My Class' ? `🎯 ${std}` : std === 'All' ? '🌟 All' : `Std ${std}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <View style={styles.noBooksBox}>
              <Text style={styles.noBooksEmoji}>📖</Text>
              <Text style={styles.noBooksTitle}>No textbooks match your filter</Text>
              <TouchableOpacity onPress={() => { setSelectedBrowseStd('All'); setSearchQuery(''); }}>
                <Text style={styles.resetFilterText}>View all books</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.bookCard, { backgroundColor: book.color }]}
                  activeOpacity={0.82}
                  onPress={() => setActiveBook(book)}
                  accessibilityLabel={`${book.subject} textbook`}
                >
                  <Text style={styles.bookEmoji}>{book.emoji}</Text>
                  <Text style={styles.bookSubject} numberOfLines={1}>{book.subject}</Text>
                  <Text style={styles.bookTag} numberOfLines={2}>{book.tag}</Text>
                  <View style={styles.bookFooterRow}>
                    <View style={styles.bookBadge}>
                      <Text style={styles.bookBadgeText}>
                        {['Nursery', 'LKG', 'UKG'].includes(book.standard)
                          ? book.standard
                          : `Std ${book.standard}`}
                      </Text>
                    </View>
                    <Text style={styles.tapToRead}>Read ›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* AI Chat Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => router.push('/(tabs)/ai-chat')}
          activeOpacity={0.85}
          accessibilityLabel="Open AI Chat"
        >
          <View style={styles.aiBannerLeft}>
            <Text style={styles.aiBannerTitle}>Have a study doubt? 🤔</Text>
            <Text style={styles.aiBannerSub}>Ask ALEX AI — step-by-step Maharashtra Board solutions</Text>
          </View>
          <View style={styles.aiBannerArrow}>
            <Text style={styles.aiBannerArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Book Detail & PDF Reader Modal */}
      <Modal
        visible={!!activeBook}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveBook(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeBook && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalEmojiBox, { backgroundColor: activeBook.color }]}>
                    <Text style={styles.modalEmoji}>{activeBook.emoji}</Text>
                  </View>
                  <View style={styles.modalHeaderText}>
                    <Text style={styles.modalTitle}>{activeBook.subject}</Text>
                    <Text style={styles.modalSub}>
                      Maharashtra State Board · Std {activeBook.standard} {activeBook.stream ? `(${activeBook.stream})` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setActiveBook(null)}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tagLineRow}>
                  <Text style={styles.curriculumTag}>✓ Balbharati Edition</Text>
                  <Text style={styles.curriculumTag}>✓ Digital PDF Available</Text>
                </View>

                <Text style={styles.chaptersTitle}>📑 Chapters in this textbook:</Text>
                <ScrollView style={styles.chaptersList} showsVerticalScrollIndicator={false}>
                  {activeBook.chapters.map((ch, idx) => (
                    <View key={idx} style={styles.chapterItem}>
                      <Text style={styles.chapterIndex}>{idx + 1}</Text>
                      <Text style={styles.chapterName}>{ch}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.readPdfBtn}
                    onPress={() => {
                      Alert.alert(
                        'Opening Textbook PDF',
                        `Loading ${activeBook.subject} (Std ${activeBook.standard}) from Maharashtra State Board repository.`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.readPdfText}>📖 Open PDF Reader</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.askAiBookBtn}
                    onPress={() => {
                      setActiveBook(null);
                      router.push('/(tabs)/ai-chat');
                    }}
                  >
                    <Text style={styles.askAiBookText}>🤖 Ask AI About This Subject</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: {
    color: Colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  profilePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  profilePillText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  avatarText: { color: Colors.textOnPrimary, fontSize: 20, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: Colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '400',
    padding: 0,
  },
  clearIcon: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  sectionTitle: { ...Typography.h4, color: Colors.text },
  sectionSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
  seeAll: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  categoriesRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  categoryCard: {
    flex: 1,
    minWidth: 70,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.small,
  },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  browseChipsRow: { gap: Spacing.xs, paddingBottom: Spacing.md },
  browseChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  browseChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  browseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  browseChipTextActive: {
    color: Colors.textOnPrimary,
  },
  booksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  bookCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  bookEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  bookSubject: { ...Typography.body1, color: Colors.text, fontWeight: '700', marginBottom: 2 },
  bookTag: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 16, minHeight: 32 },
  bookFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bookBadgeText: { color: Colors.textOnPrimary, fontSize: 10, fontWeight: '700' },
  tapToRead: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  noBooksBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noBooksEmoji: { fontSize: 40 },
  noBooksTitle: { ...Typography.body1, color: Colors.textSecondary, fontWeight: '600' },
  resetFilterText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  aiBanner: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.medium,
  },
  aiBannerLeft: { flex: 1 },
  aiBannerTitle: { color: Colors.textOnPrimary, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  aiBannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  aiBannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  aiBannerArrowText: { color: Colors.textOnPrimary, fontSize: 20, fontWeight: '700' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    maxHeight: '80%',
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmoji: { fontSize: 28 },
  modalHeaderText: { flex: 1 },
  modalTitle: { ...Typography.h3, color: Colors.text },
  modalSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  tagLineRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  curriculumTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chaptersTitle: { ...Typography.body2, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  chaptersList: { maxHeight: 180, marginBottom: Spacing.lg },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chapterIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  chapterName: { ...Typography.body2, color: Colors.text, flex: 1 },
  modalActions: { gap: Spacing.sm },
  readPdfBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  readPdfText: { ...Typography.button, color: Colors.textOnPrimary, fontSize: 16 },
  askAiBookBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.full,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  askAiBookText: { ...Typography.button, color: Colors.text, fontSize: 14 },
});
