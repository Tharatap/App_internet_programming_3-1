import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, PixelFonts, Radius } from '@/constants/theme';

const CONFIRM_TEXT = 'Confirm Delete';

interface Props {
  visible: boolean;
  productName: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** ยืนยันการลบสินค้าด้วยการพิมพ์ข้อความคงที่ กันกดพลาด — ใช้ร่วมกันทั้งหน้าลิสต์และหน้าฟอร์มแก้ไข */
export function DeleteConfirmModal({ visible, productName, deleting, onCancel, onConfirm }: Props) {
  const [input, setInput] = useState('');

  // เคลียร์ข้อความที่พิมพ์ไว้ทุกครั้งที่ modal เปิดใหม่ กันเห็นข้อความเดิมค้าง
  useEffect(() => {
    if (visible) setInput('');
  }, [visible]);

  const canConfirm = input === CONFIRM_TEXT && !deleting;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.cardWrapper}>
          <PixelPanel style={styles.card}>
            <Text style={styles.title}>ลบสินค้า</Text>
            <Text style={styles.text}>
              คุณกำลังจะลบ <Text style={styles.productName}>{productName}</Text> — การลบไม่สามารถย้อนกลับได้
            </Text>
            <Text style={styles.hint}>
              พิมพ์ "{CONFIRM_TEXT}" ให้ตรงเพื่อยืนยัน
            </Text>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={CONFIRM_TEXT}
              placeholderTextColor={Brand.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.buttonRow}>
              <PressableScale style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>ยกเลิก</Text>
              </PressableScale>
              <PressableScale
                style={[styles.deleteButton, !canConfirm && styles.deleteButtonDisabled]}
                onPress={onConfirm}
                disabled={!canConfirm}>
                <Text style={styles.deleteText}>{deleting ? 'กำลังลบ...' : 'ลบสินค้า'}</Text>
              </PressableScale>
            </View>
          </PixelPanel>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43,33,24,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  productName: {
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  hint: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  input: {
    backgroundColor: Brand.background,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Brand.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Brand.surface,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Brand.danger,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: '#ffffff',
  },
});
