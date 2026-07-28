import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { Checkbox } from '@/components/shop/checkbox';
import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { AddressInput } from '@/types/shop';

const emptyForm: AddressInput = {
  label: 'บ้าน',
  recipient: '',
  phone: '',
  line1: '',
  district: '',
  province: '',
  postcode: '',
  isDefault: false,
};

export default function EditAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the address list when editing (the list is already small/cheap to fetch).
  useFocusEffect(
    useCallback(() => {
      if (!isEditing || !token) return;
      addressesApi.list(token).then((list) => {
        const found = list.find((a) => a.id === Number(id));
        if (found) {
          const { id: _drop, ...rest } = found;
          setForm(rest);
        }
      });
    }, [isEditing, id, token])
  );

  const setField = (field: keyof AddressInput) => (text: string) =>
    setForm((prev) => ({ ...prev, [field]: text }));

  const onSubmit = async () => {
    if (!token) return;
    if (!form.recipient || !form.phone || !form.line1) {
      setError('กรุณากรอกชื่อผู้รับ เบอร์โทร และที่อยู่ให้ครบ');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isEditing) {
        await addressesApi.update(token, Number(id), form);
      } else {
        await addressesApi.create(token, form);
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title={isEditing ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'} showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled">
        <Field label="ป้ายกำกับ" value={form.label} onChangeText={setField('label')} placeholder="บ้าน, ที่ทำงาน ฯลฯ" />
        <Field label="ชื่อผู้รับ" value={form.recipient} onChangeText={setField('recipient')} placeholder="ชื่อ-นามสกุล" />
        <Field
          label="เบอร์โทร"
          value={form.phone}
          onChangeText={setField('phone')}
          placeholder="08xxxxxxxx"
          keyboardType="phone-pad"
        />
        <Field
          label="ที่อยู่"
          value={form.line1}
          onChangeText={setField('line1')}
          placeholder="บ้านเลขที่ ถนน ซอย"
          multiline
        />
        <Field label="ตำบล/แขวง" value={form.district} onChangeText={setField('district')} />
        <Field label="จังหวัด" value={form.province} onChangeText={setField('province')} />
        <Field
          label="รหัสไปรษณีย์"
          value={form.postcode}
          onChangeText={setField('postcode')}
          keyboardType="number-pad"
        />

        <View style={styles.defaultRow}>
          <Checkbox
            checked={form.isDefault}
            onToggle={() => setForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
            accessibilityLabel="ตั้งเป็นที่อยู่เริ่มต้น"
          />
          <Text style={styles.defaultLabel}>ตั้งเป็นที่อยู่เริ่มต้น</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PressableScale
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}</Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMultiline]}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={Brand.textMuted}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  input: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Brand.text,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  error: {
    fontSize: 13,
    color: Brand.danger,
  },
  submitButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
