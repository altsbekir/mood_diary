import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  // DÜZELTME 1: ScrollView'i içe aktardık
  ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useJournalStore } from '../store/useJournalStore';
import { ThemeMap } from '../theme/ThemeMap';

export default function HomeScreen() {
  const { text, wordCount, setText, saveEntry, sentimentScore, streak, fetchStreak, markedDates, entriesByDate } = useJournalStore();
  
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEntryModalVisible, setEntryModalVisible] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const currentTheme = ThemeMap[sentimentScore ?? 0] || ThemeMap[0];

  useEffect(() => {
    fetchStreak();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior="padding" 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>
            
            <View style={styles.header}>
              <TouchableOpacity 
                style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}
                onPress={() => setCalendarVisible(true)}
              >
                <Text style={styles.infoBadgeText}>📅 Takvim</Text>
              </TouchableOpacity>
              
              <View style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>{today}</Text>
              </View>
              
              <View style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>🔥 Streak: {streak}</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>Bugün neler yaşadın?</Text>

            <View style={[styles.inputContainer, { backgroundColor: currentTheme.surface, borderColor: currentTheme.primary }]}>
              <TextInput
                style={[styles.textInput, { color: currentTheme.text }]}
                multiline
                placeholder="Buraya yazmaya başla..."
                placeholderTextColor="#94A3B8"
                value={text}
                onChangeText={setText}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.footer}>
              <View style={[styles.wordCountBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>Kelime: {wordCount}</Text>
              </View>
              
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} onPress={saveEntry}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* TAKVİM MODALI */}
      <Modal
        visible={isCalendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
            <Calendar
              markingType={'custom'}
              markedDates={markedDates}
              theme={{
                calendarBackground: currentTheme.surface,
                textSectionTitleColor: currentTheme.text,
                selectedDayBackgroundColor: currentTheme.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: currentTheme.primary,
                dayTextColor: currentTheme.text,
                textDisabledColor: '#475569',
                monthTextColor: currentTheme.text,
                arrowColor: currentTheme.primary,
              }}
              onDayPress={(day: any) => {
                const entry = entriesByDate[day.dateString];
                if (entry) {
                  setSelectedEntry(entry);
                  setEntryModalVisible(true);
                }
              }}
            />
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: currentTheme.primary }]} 
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GEÇMİŞ GÜNLÜK OKUMA MODALI */}
      {selectedEntry && (
        <Modal
          visible={isEntryModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setEntryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: ThemeMap[selectedEntry.sentimentScore ?? 0].surface }]}>
              
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{selectedEntry.date}</Text>
                <View style={styles.entryStats}>
                  <Text style={styles.entryStatText}>🔥 {selectedEntry.historicalStreak}</Text>
                  <Text style={styles.entryStatText}>📝 {selectedEntry.wordCount} Kelime</Text>
                </View>
              </View>

              {/* DÜZELTME 2: Metin kutusunu View yerine ScrollView ile değiştirdik */}
              {/* Stili ScrollView'in kendisine uyguladık. contentContainerStyle'a padding'i taşıdık */}
              <ScrollView 
                style={[styles.entryTextContainer, { borderColor: ThemeMap[selectedEntry.sentimentScore ?? 0].primary }]}
                contentContainerStyle={styles.entryTextScrollContent}
                showsVerticalScrollIndicator={true} // Kaydırma çubuğunu göster
              >
                <Text style={styles.entryText}>{selectedEntry.text}</Text>
              </ScrollView>

              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: ThemeMap[selectedEntry.sentimentScore ?? 0].primary }]} 
                onPress={() => setEntryModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Geri Dön</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  inner: { flex: 1, padding: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  infoBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, elevation: 2 },
  infoBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#E2E8F0', marginBottom: 10 },
  inputContainer: { flex: 1, minHeight: 150, borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 20 },
  textInput: { flex: 1, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 },
  wordCountBadge: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  saveButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20, elevation: 5 },
  closeButton: { marginTop: 20, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 },

  // Geçmiş Günlük Modal Stilleri
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  entryDate: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  entryStats: { flexDirection: 'row', gap: 10 },
  entryStatText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  
  // DÜZELTME 3: entryTextContainer stilini ScrollView'e göre güncelledik
  entryTextContainer: { 
    maxHeight: 300, // Kaydırılabilir pencerenin maksimum yüksekliği
    // Padding'i buradan çıkarıp contentContainerStyle'a taşıdık
    borderRadius: 10, 
    borderWidth: 1, 
    backgroundColor: 'rgba(0,0,0,0.2)' 
  },
  
  // DÜZELTME 4: ScrollView'in içindeki içerik için yeni bir stil ekledik (metnin etrafındaki boşluk)
  entryTextScrollContent: {
    padding: 15, // Metnin etrafındaki padding
  },
  
  entryText: { color: '#F8FAFC', fontSize: 16, lineHeight: 24 },
});