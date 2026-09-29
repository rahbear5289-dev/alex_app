import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';
import { useProfile } from '../../context/ProfileContext';

export type Note = {
  id: string;
  title: string;
  subject: string;
  type: 'notes' | 'formula' | 'practical' | 'scanned';
  preview: string;
  content?: string;
  updatedAt: string;
  emoji: string;
  pageCount?: number;
};

const DEFAULT_NOTES: Note[] = [
  {
    id: 'def-1',
    title: 'Algebra & Geometry Key Formulas',
    subject: 'Mathematics',
    type: 'formula',
    preview: 'Quadratic formula, Arithmetic Progression terms, Pythagoras theorem & coordinate distance…',
    content: `📐 **MATHEMATICS PART 1 & 2 FORMULA SHEET**\n\n1. **Quadratic Formula:**\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\nDiscriminant $\\Delta = b^2 - 4ac$\n• If $\\Delta > 0$: real and unequal roots\n• If $\\Delta = 0$: real and equal roots\n• If $\\Delta < 0$: no real roots\n\n2. **Arithmetic Progression (A.P.):**\n• $n^{\\text{th}}$ term: $t_n = a + (n - 1)d$\n• Sum of $n$ terms: $S_n = \\frac{n}{2}[2a + (n - 1)d] = \\frac{n}{2}[t_1 + t_n]$\n\n3. **Coordinate Geometry:**\n• Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$\n• Section formula: $x = \\frac{mx_2 + nx_1}{m + n}, y = \\frac{my_2 + ny_1}{m + n}$`,
    updatedAt: 'Today',
    emoji: '📐',
  },
  {
    id: 'def-2',
    title: 'Photosynthesis & Respiration Notes',
    subject: 'Science',
    type: 'notes',
    preview: 'Cellular energy production, Glycolysis, Krebs cycle, and Chloroplast light reactions…',
    content: `🌿 **SCIENCE PART 2: LIFE PROCESSES**\n\n**1. Respiration in Organisms:**\n• **Glycolysis (EMP Pathway):** Occurs in cytoplasm. One molecule of glucose is oxidized step-by-step into two molecules of pyruvic acid, ATP, NADH2, and water.\n• **Tricarboxylic Acid Cycle (Krebs Cycle):** Occurs inside the mitochondria.\n• **Electron Transfer Chain Reaction (ETC):** Molecules of NADH2 and FADH2 produce ATP molecules and water.\n\n**2. Important Exam Definitions:**\n• Cellular Respiration\n• Fermentation\n• Adenosine Triphosphate (ATP) as energy currency of the cell.`,
    updatedAt: 'Yesterday',
    emoji: '🌿',
  },
  {
    id: 'def-3',
    title: 'Chemistry Lab: Acid-Base Titration',
    subject: 'Science',
    type: 'practical',
    preview: 'Titration of 0.1M HCl against standard NaOH using Phenolphthalein indicator…',
    content: `🔬 **PRACTICAL JOURNAL: EXPERIMENT NO. 4**\n\n**Aim:** To determine the strength and molarity of given dilute Hydrochloric Acid solution by titrating against standard 0.1M Sodium Hydroxide solution.\n\n**Apparatus:** Burette, Pipette (10 ml), Conical flask, Beaker, Funnel, Clamp stand.\n**Chemicals:** 0.1M NaOH solution, dilute HCl, Phenolphthalein indicator.\n\n**Procedure:**\n1. Rinse and fill the burette with given dilute HCl up to zero mark.\n2. Pipette out 10 ml of standard 0.1M NaOH solution into a clean conical flask.\n3. Add 1-2 drops of Phenolphthalein indicator (solution turns pink).\n4. Titrate by adding HCl dropwise until the pink color just disappears (end point).\n5. Repeat to get three concordant readings.\n\n**Precaution:** Read lower meniscus for colorless solutions and upper meniscus for colored solutions.`,
    updatedAt: '3 days ago',
    emoji: '⚗️',
  },
  {
    id: 'def-4',
    title: 'Physics Mechanics & Newton Formulas',
    subject: 'Physics',
    type: 'formula',
    preview: 'Gravitational constant G, escape velocity, kinetic energy, and rotational torque equations…',
    content: `⚡ **PHYSICS QUICK-REFERENCE FORMULAS**\n\n1. **Universal Law of Gravitation:**\n$$F = G \\frac{m_1 m_2}{r^2}$$\nwhere $G = 6.673 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$\n\n2. **Acceleration due to Gravity ($g$):**\n$$g = \\frac{GM}{R^2} \\approx 9.8 \\text{ m/s}^2$$\n\n3. **Escape Velocity:**\n$$v_{\\text{esc}} = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR} \\approx 11.2 \\text{ km/s}$$`,
    updatedAt: '1 week ago',
    emoji: '⚡',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📚', color: Colors.primary },
  { id: 'notes', label: 'Notes', emoji: '📝', color: '#1976D2' },
  { id: 'formula', label: 'Formulas', emoji: '🧮', color: '#7B1FA2' },
  { id: 'practical', label: 'Practicals', emoji: '🔬', color: '#E65100' },
  { id: 'scanned', label: 'Scanned', emoji: '📷', color: '#00695C' },
];

const TYPE_COLORS: Record<Note['type'], string> = {
  notes: '#E3F2FD',
  formula: '#F3E5F5',
  practical: '#FFF3E0',
  scanned: '#E0F2F1',
};

const TYPE_BADGE_COLORS: Record<Note['type'], string> = {
  notes: '#1976D2',
  formula: '#7B1FA2',
  practical: '#E65100',
  scanned: '#00695C',
};

export default function Notes() {
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ category?: string }>();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotes, setAllNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [readingNote, setReadingNote] = useState<Note | null>(null);

  // New Note Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState<Note['type']>('notes');
  const [newContent, setNewContent] = useState('');

  // Handle category deep link parameter from Home page quick access
  useEffect(() => {
    if (params?.category) {
      setActiveCategory(params.category);
    }
  }, [params?.category]);

  // Load custom notes from AsyncStorage on mount
  useEffect(() => {
    const loadStoredNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem('@alex_user_notes');
        if (stored) {
          const parsed: Note[] = JSON.parse(stored);
          setAllNotes([...parsed, ...DEFAULT_NOTES]);
        }
      } catch (e) {
        console.error('Failed to load notes from storage', e);
      }
    };
    loadStoredNotes();
  }, []);

  const filteredNotes = allNotes.filter((n) => {
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateNote = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a note title.');
      return;
    }

    const created: Note = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General',
      type: newType,
      preview: newContent.trim().slice(0, 100) || 'Personal study notes.',
      content: newContent.trim(),
      updatedAt: 'Just now',
      emoji: newType === 'formula' ? '🧮' : newType === 'practical' ? '🔬' : '📝',
    };

    const updated = [created, ...allNotes];
    setAllNotes(updated);

    try {
      const customOnly = updated.filter((n) => n.id.startsWith('custom-') || n.id.startsWith('scan-'));
      await AsyncStorage.setItem('@alex_user_notes', JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to persist note', e);
    }

    setNewTitle('');
    setNewSubject('');
    setNewContent('');
    setCreateModalVisible(false);
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert('Delete Note', `Are you sure you want to remove "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = allNotes.filter((n) => n.id !== note.id);
          setAllNotes(updated);
          try {
            const customOnly = updated.filter((n) => n.id.startsWith('custom-') || n.id.startsWith('scan-'));
            await AsyncStorage.setItem('@alex_user_notes', JSON.stringify(customOnly));
          } catch (e) {
            console.error('Failed to update storage after delete', e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>📝 Study Notes & Formulas</Text>
            <Text style={styles.headerSubtitle}>
              {profile?.standard ? `Std ${profile.standard}` : 'All Standards'} · Maharashtra State Board
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addNoteHeaderBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Create note"
          >
            <Text style={styles.addNoteHeaderBtnText}>+ New Note</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, formulas, practicals…"
            placeholderTextColor="rgba(255,255,255,0.65)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search notes"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                activeCategory === cat.id && [styles.filterChipActive, { backgroundColor: cat.color }],
              ]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.8}
              accessibilityLabel={`Filter by ${cat.label}`}
            >
              <Text style={styles.filterChipEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === cat.id && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Showing {filteredNotes.length} item{filteredNotes.length === 1 ? '' : 's'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
            <Text style={styles.scanLink}>📷 Scan new document</Text>
          </TouchableOpacity>
        </View>

        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try searching with different subject keywords.'
                : 'Tap "+ New Note" to jot down formulas or scan handwritten pages.'}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteCard, { backgroundColor: TYPE_COLORS[note.type] }]}
              onPress={() => setReadingNote(note)}
              onLongPress={() => handleDeleteNote(note)}
              activeOpacity={0.82}
              accessibilityLabel={`${note.title} note`}
            >
              <View style={styles.noteLeft}>
                <Text style={styles.noteEmoji}>{note.emoji}</Text>
              </View>
              <View style={styles.noteContent}>
                <View style={styles.noteTitleRow}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: TYPE_BADGE_COLORS[note.type] }]}>
                    <Text style={styles.typeBadgeText}>{note.type}</Text>
                  </View>
                </View>
                <Text style={styles.noteSubject}>{note.subject}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.preview}
                </Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>🕐 {note.updatedAt}</Text>
                  <Text style={styles.readMoreText}>Read Note ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Note Reader Modal (FR8.3) */}
      <Modal
        visible={!!readingNote}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReadingNote(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalReaderContent}>
            {readingNote && (
              <>
                <View style={styles.readerHeader}>
                  <View style={styles.readerHeaderLeft}>
                    <View style={[styles.typeBadge, { backgroundColor: TYPE_BADGE_COLORS[readingNote.type] }]}>
                      <Text style={styles.typeBadgeText}>{readingNote.type}</Text>
                    </View>
                    <Text style={styles.readerSubject}>{readingNote.subject}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setReadingNote(null)}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.readerTitle}>{readingNote.title}</Text>
                <Text style={styles.readerDate}>Updated {readingNote.updatedAt}</Text>

                <ScrollView style={styles.readerBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.readerText}>
                    {readingNote.content || readingNote.preview}
                  </Text>
                </ScrollView>

                <View style={styles.readerFooter}>
                  <TouchableOpacity
                    style={styles.askAiNoteBtn}
                    onPress={() => {
                      setReadingNote(null);
                      router.push('/(tabs)/ai-chat');
                    }}
                  >
                    <Text style={styles.askAiNoteText}>🤖 Ask ALEX AI about this note</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Note Modal (FR8.2) */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCreateContent}>
            <View style={styles.createHeader}>
              <Text style={styles.createHeaderTitle}>✍️ Create Study Note</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="Title (e.g. Gravity Formulas)"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor={Colors.placeholder}
            />

            <TextInput
              style={styles.formInput}
              placeholder="Subject (e.g. Science / Mathematics)"
              value={newSubject}
              onChangeText={setNewSubject}
              placeholderTextColor={Colors.placeholder}
            />

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              {(['notes', 'formula', 'practical'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeSelectChip,
                    newType === t && styles.typeSelectChipActive,
                  ]}
                  onPress={() => setNewType(t)}
                >
                  <Text
                    style={[
                      styles.typeSelectText,
                      newType === t && styles.typeSelectTextActive,
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Enter your notes, steps, formulas or key definitions…"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={6}
              placeholderTextColor={Colors.placeholder}
            />

            <TouchableOpacity
              style={styles.saveNewNoteBtn}
              onPress={handleCreateNote}
              activeOpacity={0.85}
            >
              <Text style={styles.saveNewNoteText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerTitle: { color: Colors.textOnPrimary, fontSize: 19, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  addNoteHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  addNoteHeaderBtnText: { color: Colors.textOnPrimary, fontSize: 12, fontWeight: '700' },
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
    marginTop: Spacing.xs,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, color: Colors.textOnPrimary, fontSize: 15, padding: 0 },
  clearIcon: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },
  filterContainer: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: { borderColor: 'transparent' },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textOnPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsText: { ...Typography.caption, color: Colors.textSecondary },
  scanLink: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl * 1.5 },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.xs },
  emptySubtitle: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  noteCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadows.small,
  },
  noteLeft: { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  noteEmoji: { fontSize: 28 },
  noteContent: { flex: 1 },
  noteTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2, flexWrap: 'wrap' },
  noteTitle: { ...Typography.body1, color: Colors.text, fontWeight: '700', flex: 1 },
  typeBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 7, paddingVertical: 2 },
  typeBadgeText: { color: Colors.textOnPrimary, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  noteSubject: { ...Typography.caption, color: Colors.primary, fontWeight: '700', marginBottom: 4 },
  notePreview: { ...Typography.body2, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteDate: { ...Typography.caption, color: Colors.placeholder },
  readMoreText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  // Reader Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalReaderContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    maxHeight: '85%',
    ...Shadows.large,
  },
  readerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  readerHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  readerSubject: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  readerTitle: { ...Typography.h3, color: Colors.text, marginBottom: 2 },
  readerDate: { ...Typography.caption, color: Colors.placeholder, marginBottom: Spacing.md },
  readerBody: { maxHeight: 300, marginBottom: Spacing.lg },
  readerText: { ...Typography.body1, color: Colors.text, lineHeight: 24 },
  readerFooter: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  askAiNoteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  askAiNoteText: { ...Typography.button, color: Colors.textOnPrimary, fontSize: 15 },

  // Create Modal styles
  modalCreateContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  createHeaderTitle: { ...Typography.h3, color: Colors.text },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    fontSize: 15,
    color: Colors.text,
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeSelectorRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeSelectChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeSelectChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeSelectText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  typeSelectTextActive: { color: Colors.textOnPrimary },
  saveNewNoteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  saveNewNoteText: { ...Typography.button, color: Colors.textOnPrimary, fontSize: 16 },
});
