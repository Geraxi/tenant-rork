import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Calendar,
  Euro,
  FileText,
  Save,
  X,
  ChevronDown,
  Plus,
  Edit3,
  Check,
  Trash2
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { trpc } from '@/lib/trpc';
import { 
  contractTemplates, 
  additionalClauses, 
  ContractTemplate, 
  ContractClause 
} from '@/constants/contract-templates';

interface ContractForm {
  property_id: string;
  tenant_ids: string[];
  title: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  deposit: string;
  clauses: string;
  notes: string;
  template_id?: string;
  selected_clauses: ContractClause[];
}

export default function CreateContractScreen() {
  const [form, setForm] = useState<ContractForm>({
    property_id: '',
    tenant_ids: [],
    title: 'Contratto di Locazione',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    deposit: '',
    clauses: '',
    notes: '',
    template_id: '',
    selected_clauses: [],
  });

  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showClausesModal, setShowClausesModal] = useState<boolean>(false);
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);
  const [customClauseText, setCustomClauseText] = useState<string>('');

  const createContractMutation = trpc.contracts.create.useMutation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedTemplate = useMemo(() => {
    return contractTemplates.find(t => t.id === form.template_id);
  }, [form.template_id]);

  const finalClauses = useMemo(() => {
    if (form.selected_clauses.length > 0) {
      return form.selected_clauses.map((clause, index) => 
        `${index + 1}. ${clause.title.toUpperCase()}\n${clause.content}`
      ).join('\n\n');
    }
    return form.clauses;
  }, [form.selected_clauses, form.clauses]);

  const handleInputChange = (field: keyof ContractForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectTemplate = (template: ContractTemplate) => {
    setForm(prev => ({
      ...prev,
      template_id: template.id,
      clauses: template.clauses,
      selected_clauses: [...template.basicClauses],
      title: prev.title || `${template.name} - Property Contract`,
    }));
    setShowTemplateModal(false);
  };

  const addClause = (clause: ContractClause) => {
    if (!form.selected_clauses.find(c => c.id === clause.id)) {
      setForm(prev => ({
        ...prev,
        selected_clauses: [...prev.selected_clauses, clause],
      }));
    }
  };

  const removeClause = (clauseId: string) => {
    setForm(prev => ({
      ...prev,
      selected_clauses: prev.selected_clauses.filter(c => c.id !== clauseId),
    }));
  };

  const updateClause = (clauseId: string, newContent: string) => {
    setForm(prev => ({
      ...prev,
      selected_clauses: prev.selected_clauses.map(c => 
        c.id === clauseId ? { ...c, content: newContent } : c
      ),
    }));
  };

  const addCustomClause = () => {
    if (customClauseText.trim()) {
      const customClause: ContractClause = {
        id: `custom_${Date.now()}`,
        title: 'Custom Clause',
        content: customClauseText.trim(),
        required: false,
        category: 'special',
        editable: true,
      };
      addClause(customClause);
      setCustomClauseText('');
      setShowClausesModal(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      Alert.alert('Errore', 'Inserisci il titolo del contratto');
      return false;
    }
    if (!form.start_date.trim()) {
      Alert.alert('Errore', 'Inserisci la data di inizio');
      return false;
    }
    if (!form.end_date.trim()) {
      Alert.alert('Errore', 'Inserisci la data di fine');
      return false;
    }
    if (!form.monthly_rent.trim() || isNaN(Number(form.monthly_rent))) {
      Alert.alert('Errore', 'Inserisci un canone mensile valido');
      return false;
    }
    if (!form.deposit.trim() || isNaN(Number(form.deposit))) {
      Alert.alert('Errore', 'Inserisci un deposito cauzionale valido');
      return false;
    }
    if (!finalClauses.trim()) {
      Alert.alert('Errore', 'Inserisci le clausole contrattuali o seleziona un template');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await createContractMutation.mutateAsync({
        title: form.title,
        start_date: form.start_date,
        end_date: form.end_date,
        monthly_rent: Number(form.monthly_rent),
        deposit: Number(form.deposit),
        clauses: finalClauses,
        notes: form.notes || undefined,
        template_url: selectedTemplate?.id,
      });
      
      console.log('Contract created:', result.contract.id);
      
      Alert.alert(
        'Successo',
        'Contratto creato con successo! Gli inquilini riceveranno una notifica per firmarlo.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating contract:', error);
      Alert.alert('Errore', 'Errore nella creazione del contratto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Crea Contratto',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.headerButton}
              disabled={isLoading}
            >
              <Save size={24} color={isLoading ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selezione Template</Text>
          
          <TouchableOpacity 
            style={styles.templateSelector}
            onPress={() => setShowTemplateModal(true)}
          >
            <View style={styles.templateSelectorContent}>
              <FileText size={20} color={Colors.primary} />
              <View style={styles.templateSelectorText}>
                <Text style={styles.templateSelectorTitle}>
                  {selectedTemplate ? selectedTemplate.name : 'Seleziona Template Contratto'}
                </Text>
                {selectedTemplate && (
                  <Text style={styles.templateSelectorDescription}>
                    {selectedTemplate.description}
                  </Text>
                )}
              </View>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Contratto</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titolo Contratto</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="es. Contratto di Locazione - Via Roma 123"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Data Inizio</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.inputText}
                  value={form.start_date}
                  onChangeText={(value) => handleInputChange('start_date', value)}
                  placeholder="AAAA-MM-GG"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Data Fine</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.inputText}
                  value={form.end_date}
                  onChangeText={(value) => handleInputChange('end_date', value)}
                  placeholder="AAAA-MM-GG"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condizioni Economiche</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Canone Mensile</Text>
              <View style={styles.inputWithIcon}>
                <Euro size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.inputText}
                  value={form.monthly_rent}
                  onChangeText={(value) => handleInputChange('monthly_rent', value)}
                  placeholder="800"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Deposito Cauzionale</Text>
              <View style={styles.inputWithIcon}>
                <Euro size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.inputText}
                  value={form.deposit}
                  onChangeText={(value) => handleInputChange('deposit', value)}
                  placeholder="1600"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clausole Contrattuali</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowClausesModal(true)}
            >
              <Plus size={16} color={Colors.background} />
              <Text style={styles.addButtonText}>Aggiungi Clausola</Text>
            </TouchableOpacity>
          </View>
          
          {form.selected_clauses.length > 0 ? (
            <View style={styles.clausesList}>
              {form.selected_clauses.map((clause, index) => (
                <View key={clause.id} style={styles.clauseItem}>
                  <View style={styles.clauseHeader}>
                    <Text style={styles.clauseTitle}>
                      {index + 1}. {clause.title}
                    </Text>
                    <View style={styles.clauseActions}>
                      {clause.editable && (
                        <TouchableOpacity
                          onPress={() => {
                            setEditingClause(clause);
                            setCustomClauseText(clause.content);
                          }}
                          style={styles.clauseActionButton}
                        >
                          <Edit3 size={16} color={Colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!clause.required && (
                        <TouchableOpacity
                          onPress={() => removeClause(clause.id)}
                          style={styles.clauseActionButton}
                        >
                          <Trash2 size={16} color={Colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Text style={styles.clauseContent}>{clause.content}</Text>
                  {clause.required && (
                    <Text style={styles.requiredLabel}>Required</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clausole Personalizzate</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.clauses}
                onChangeText={(value) => handleInputChange('clauses', value)}
                placeholder="Inserisci le clausole contrattuali manualmente o seleziona un template sopra..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note Aggiuntive (Opzionale)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Note aggiuntive..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <FileText size={20} color={Colors.background} />
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creazione Contratto...' : 'Crea Contratto'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleziona Template Contratto</Text>
            <TouchableOpacity
              onPress={() => setShowTemplateModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={contractTemplates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.templateItem,
                  form.template_id === item.id && styles.templateItemSelected
                ]}
                onPress={() => selectTemplate(item)}
              >
                <View style={styles.templateItemContent}>
                  <Text style={styles.templateItemName}>{item.name}</Text>
                  <Text style={styles.templateItemDescription}>{item.description}</Text>
                  <Text style={styles.templateItemCategory}>{item.category.toUpperCase()}</Text>
                </View>
                {form.template_id === item.id && (
                  <Check size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Add Clauses Modal */}
      <Modal
        visible={showClausesModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aggiungi Clausole Contrattuali</Text>
            <TouchableOpacity
              onPress={() => {
                setShowClausesModal(false);
                setCustomClauseText('');
              }}
              style={styles.modalCloseButton}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aggiungi Clausola Personalizzata</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customClauseText}
                onChangeText={setCustomClauseText}
                placeholder="Inserisci la tua clausola personalizzata..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.addButton, { alignSelf: 'flex-start' }]}
                onPress={addCustomClause}
                disabled={!customClauseText.trim()}
              >
                <Plus size={16} color={Colors.background} />
                <Text style={styles.addButtonText}>Aggiungi Clausola Personalizzata</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clausole Standard</Text>
              {additionalClauses.map((clause) => (
                <TouchableOpacity
                  key={clause.id}
                  style={[
                    styles.clauseOption,
                    form.selected_clauses.find(c => c.id === clause.id) && styles.clauseOptionSelected
                  ]}
                  onPress={() => addClause(clause)}
                  disabled={!!form.selected_clauses.find(c => c.id === clause.id)}
                >
                  <View style={styles.clauseOptionContent}>
                    <Text style={styles.clauseOptionTitle}>{clause.title}</Text>
                    <Text style={styles.clauseOptionDescription} numberOfLines={2}>
                      {clause.content}
                    </Text>
                  </View>
                  {form.selected_clauses.find(c => c.id === clause.id) ? (
                    <Check size={20} color={Colors.primary} />
                  ) : (
                    <Plus size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Clause Modal */}
      <Modal
        visible={!!editingClause}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modifica Clausola</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingClause(null);
                setCustomClauseText('');
              }}
              style={styles.modalCloseButton}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.label}>Titolo Clausola</Text>
              <Text style={styles.clauseTitleDisplay}>{editingClause?.title}</Text>
              
              <Text style={styles.label}>Contenuto Clausola</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customClauseText}
                onChangeText={setCustomClauseText}
                placeholder="Modifica il contenuto della clausola..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (editingClause) {
                    updateClause(editingClause.id, customClauseText);
                    setEditingClause(null);
                    setCustomClauseText('');
                  }
                }}
              >
                <Save size={16} color={Colors.background} />
                <Text style={styles.saveButtonText}>Salva Modifiche</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  templateSelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  templateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  templateSelectorText: {
    flex: 1,
    marginLeft: 12,
  },
  templateSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  templateSelectorDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  clausesList: {
    gap: 12,
  },
  clauseItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.background,
  },
  clauseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clauseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  clauseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clauseActionButton: {
    padding: 4,
  },
  clauseContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  requiredLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  templateItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  templateItemContent: {
    flex: 1,
  },
  templateItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  templateItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  templateItemCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  clauseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  clauseOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  clauseOptionContent: {
    flex: 1,
  },
  clauseOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  clauseOptionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clauseTitleDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});