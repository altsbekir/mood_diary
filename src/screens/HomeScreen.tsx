import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useJournalStore } from '../store/useJournalStore';
import { getTodayDateString } from '../utils/dateHelpers';

export default function HomeScreen() {
  // Zustand store'dan state ve fonksiyonları çekiyoruz
  const { entryText, wordCount, setEntryText } = useJournalStore();
  
  // Bugünü YYYY-MM-DD formatında alıyoruz
  const today = getTodayDateString();

  const handleSave = () => {
    // Şimdilik sadece konsola yazdırıyoruz. Firestore entegrasyonu bir sonraki adımda olacak.
    console.log("Kaydedilecek metin:", entryText);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Klavye açıldığında butonun altta kalmaması için KeyboardAvoidingView kullanıyoruz */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Üst Kısım: Tarih ve Streak */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.streakText}>🔥 Streak: 0</Text> 
        </View>

        {/* Orta Kısım: Yazı Alanı */}
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Bugün neler yaşadın?</Text>
          
          <TextInput
            style={styles.textInput}
            multiline={true}
            placeholder="Buraya yazmaya başla..."
            value={entryText}
            onChangeText={setEntryText}
            textAlignVertical="top" // Android'de yazının üstten başlaması için
          />
          
          {/* Canlı Kelime Sayacı */}
          <Text style={styles.wordCount}>Kelime: {wordCount}</Text>
        </View>

        {/* Alt Kısım: Kaydet Butonu */}
        <TouchableOpacity 
          style={[styles.saveButton, wordCount === 0 && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={wordCount === 0} // Yazı yoksa butona basılamaz
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardView: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  streakText: { fontSize: 16, fontWeight: 'bold', color: '#FF8C00' },
  content: { flex: 1 },
  placeholderText: { fontSize: 18, color: '#666', marginBottom: 15, fontWeight: '500' },
  textInput: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  wordCount: { textAlign: 'right', marginTop: 10, color: '#888', fontSize: 14, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonDisabled: { backgroundColor: '#A5D6A7' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});