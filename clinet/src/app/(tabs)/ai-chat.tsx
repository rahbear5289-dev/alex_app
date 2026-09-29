import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../../context/ProfileContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for easy serialization
};

const CHAT_STORAGE_KEY = '@alex_ai_chat_history';

const SUGGESTED_QUESTIONS = [
  "Explain the Pythagoras theorem",
  "What is photosynthesis?",
  "Chhatrapati Shivaji Maharaj administration",
  "Newton's three laws of motion",
];

// Curriculum-aware knowledge base for Maharashtra Board
function generateCurriculumResponse(query: string, profile: any): string {
  const q = query.toLowerCase();
  const standard = profile?.standard ? `Std ${profile.standard}` : 'Maharashtra State Board';

  if (q.includes('pythagoras')) {
    return `📐 **Pythagoras Theorem (${standard} Mathematics Part 2)**\n\n**Statement:**\nIn a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the remaining two sides.\n\n$$\\text{Hypotenuse}^2 = \\text{Base}^2 + \\text{Height}^2$$\n$$c^2 = a^2 + b^2$$\n\n**Key Exam Steps for Maharashtra Board:**\n1. Draw $\\triangle ABC$ with $\\angle B = 90^\\circ$.\n2. Draw perpendicular altitude $BD \\perp AC$.\n3. Use similarity of triangles: $\\triangle ADB \\sim \\triangle ABC$ and $\\triangle BDC \\sim \\triangle ABC$.\n4. Combine equations to prove $AC^2 = AB^2 + BC^2$.\n\n💡 *Tip: Remember Pythagorean triplets like (3, 4, 5) and (5, 12, 13) for quick 1-mark objective questions!*`;
  }

  if (q.includes('photosynthesis')) {
    return `🌿 **Photosynthesis (${standard} Science)**\n\n**Definition:**\nThe biological process by which green plants and certain other organisms transform light energy into chemical energy stored in glucose.\n\n**Chemical Equation:**\n$$6CO_2 + 12H_2O \\xrightarrow[Chlorophyll]{Sunlight} C_6H_{12}O_6 + 6O_2 + 6H_2O$$\n\n**Two Main Stages:**\n1. **Light-Dependent Phase (Granum):** Photolysis of water releases oxygen gas.\n2. **Light-Independent Phase (Calvin Cycle in Stroma):** Carbon dioxide is reduced to glucose.\n\n💡 *Maharashtra Board Tip: Don't forget to label Chloroplast, Stroma, and Grana in diagrams!*`;
  }

  if (q.includes('shivaji') || q.includes('history') || q.includes('maharashtra')) {
    return `🏛️ **Maharashtra State Board History: Swarajya & Administration**\n\n**Chhatrapati Shivaji Maharaj's Governance:**\n1. **Ashta Pradhan Mandal:** Council of eight ministers headed by the Pantpradhan (Peshwa) to supervise administration.\n2. **Military Strategy:** Establishment of hill forts (Rajgad, Raigad), sea forts (Sindhudurg, Vijaydurg), and independent naval fleet.\n3. **Ryotwari Agricultural Policy:** Fixed land revenue, relief during drought, and protection of farmers from feudal middlemen.\n\n💡 *Important for SSC Board: Practice answering the 4-mark short note on 'Ashta Pradhan Mandal' and military discipline.*`;
  }

  if (q.includes('newton') || q.includes('gravity') || q.includes('motion')) {
    return `⚡ **Newton's Laws of Motion (${standard} Science 1 / Physics)**\n\n1. **First Law (Inertia):** An object remains at rest or uniform motion unless acted upon by an external unbalanced force.\n2. **Second Law (Momentum):** Rate of change of momentum is proportional to applied force ($F = m \\times a$).\n3. **Third Law (Action & Reaction):** For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$).\n\n💡 *Units to remember:* Force in SI is Newton (N), momentum is kg·m/s.`;
  }

  return `🎓 **ALEX AI Answer (${profile?.board ?? 'Maharashtra Board'} · ${standard})**\n\nRegarding: **"${query}"**\n\nHere is the step-by-step curriculum explanation:\n• **Core Concept:** According to the Maharashtra State Board textbook syllabus, this topic focuses on foundational understanding and application.\n• **Key Points:**\n  1. Review the relevant chapter summary in your textbook.\n  2. Memorize the essential definitions and standard terminology.\n  3. Practice the textbook exercise questions (स्वाध्याय / Exercises at the chapter end).\n\nFeel free to ask for specific step-by-step problem solutions or formulas! 🤖`;
}

export default function AIChat() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history from AsyncStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          // Default initial greeting
          const initialGreeting: Message = {
            id: 'init-0',
            role: 'assistant',
            content: `Namaste! I'm ALEX AI 🤖\n\nI'm your 24/7 study partner for the ${
              profile?.board ?? 'Maharashtra State Board'
            } curriculum (${profile?.standard ? `Std ${profile.standard}` : 'Nursery to 12th'}).\n\nAsk me any question from Maths, Science, History, Languages, or Senior Secondary streams!`,
            timestamp: new Date().toISOString(),
          };
          setMessages([initialGreeting]);
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    };
    loadHistory();
  }, [profile]);

  // Persist messages whenever changed
  const saveMessages = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveMessages(updatedWithUser);
    setInputText('');
    setIsTyping(true);

    try {
      // Simulate realistic AI response generation
      await new Promise((res) => setTimeout(res, 900));
      const response = generateCurriculumResponse(trimmed, profile);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      const updatedWithAi = [...updatedWithUser, aiMsg];
      setMessages(updatedWithAi);
      saveMessages(updatedWithAi);
    } catch (err) {
      Alert.alert('Error', 'Failed to get a response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [messages, profile]);

  const clearChat = () => {
    Alert.alert('Clear Chat', 'Start a fresh doubt-solving session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const freshGreeting: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `New chat started! What Maharashtra State Board topic would you like help with today? 🤖`,
            timestamp: new Date().toISOString(),
          };
          setMessages([freshGreeting]);
          await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
        },
      },
    ]);
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>A</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatarLarge}>
            <Text style={styles.aiAvatarLargeText}>A</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>ALEX AI Doubt Solver</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                Online · {profile?.standard ? `Std ${profile.standard}` : 'Maharashtra Board'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={clearChat}
          accessibilityLabel="Start new chat"
        >
          <Text style={styles.clearBtnText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>A</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>ALEX AI is generating your explanation…</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>💡 Quick Questions to Try:</Text>
          <View style={styles.suggestionsRow}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => sendMessage(q)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask any question, formula or doubt…"
          placeholderTextColor={Colors.placeholder}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          returnKeyType="default"
          accessibilityLabel="Type your doubt"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isTyping}
          activeOpacity={0.85}
          accessibilityLabel="Send doubt to AI"
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  aiAvatarLargeText: { color: Colors.textOnPrimary, fontSize: 22, fontWeight: '800' },
  headerTitle: { color: Colors.textOnPrimary, fontSize: 17, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#A5D6A7' },
  onlineText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '500' },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clearBtnText: { color: Colors.textOnPrimary, fontSize: 12, fontWeight: '600' },
  messageList: { flex: 1 },
  messageListContent: { padding: Spacing.md, paddingBottom: Spacing.sm },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { color: Colors.textOnPrimary, fontSize: 14, fontWeight: '800' },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: Spacing.md,
    ...Shadows.small,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { ...Typography.body2, color: Colors.text, lineHeight: 22 },
  bubbleTextUser: { color: Colors.textOnPrimary },
  bubbleTime: { ...Typography.caption, color: Colors.textSecondary, marginTop: 6, textAlign: 'right', fontSize: 10 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.75)' },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  typingText: { ...Typography.caption, color: Colors.textSecondary },
  suggestions: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  suggestionsLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm, fontWeight: '700' },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  suggestionChip: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  suggestionText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  sendBtnDisabled: { backgroundColor: Colors.disabled },
  sendBtnText: { color: Colors.textOnPrimary, fontSize: 16 },
});
