import React from 'react';
import { ThemeMap } from '../theme/ThemeMap';
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
  TouchableWithoutFeedback
} from 'react-native';
import { useJournalStore } from '../store/useJournalStore';

export default function HomeScreen() {
  // sentimentScore'u da içeri aktarıyoruz
  const { text, wordCount, setText, saveEntry, sentimentScore } = useJournalStore();
  
  const today = new Date().toISOString().split('T')[0];

  // Aktif temayı belirliyoruz. Eğer bir sebepten bulamazsa her zaman '0' (Nötr) temayı yedek (fallback) olarak kullan!
  const currentTheme = ThemeMap[sentimentScore ?? 0] || ThemeMap[0];
  return (
    // SafeAreaView'un arkaplanı değişiyor
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior="padding" 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>
            
            <View style={styles.header}>
              {/* Rozetlerin rengi değişiyor */}
              <TouchableOpacity style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>Takvim</Text>
              </TouchableOpacity>
              
              <View style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>{today}</Text>
              </View>
              
              <View style={[styles.infoBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>Streak: 0</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>Bugün neler yaşadın?</Text>

            {/* Yazı alanının arkaplanı ve çerçevesi değişiyor */}
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
              {/* Kelime sayacı rengi değişiyor */}
              <View style={[styles.wordCountBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.infoBadgeText}>Kelime: {wordCount}</Text>
              </View>
              
              {/* Kaydet butonu rengi değişiyor */}
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} onPress={saveEntry}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    paddingBottom: 20, // Alt butonlara nefes aldırır
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  infoBadge: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1, // Ekran küçüldüğünde bu alan esneyip daralacak
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10, // iPhone çentiği veya Android navbar'ı için ekstra güvenli boşluk
  },
  wordCountBadge: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});