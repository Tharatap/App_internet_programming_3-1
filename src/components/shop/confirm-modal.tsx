import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, PixelBorder, PixelFonts, Radius } from '@/constants/theme';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  destructive = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.backdropTint} pointerEvents="none" />
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.cardWrapper}>
          <PixelPanel style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.buttonRow}>
              <PressableScale style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </PressableScale>
              <PressableScale
                style={[styles.confirmButton, destructive && styles.destructiveButton]}
                onPress={onConfirm}>
                <Text
                  style={[styles.confirmText, destructive && styles.destructiveButtonText]}>
                  {confirmText}
                </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdropTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Brand.text,
    opacity: 0.5,
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
    fontSize: 16,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
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
    borderRadius: Radius.md,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    backgroundColor: Brand.accent,
  },
  destructiveButton: {
    backgroundColor: Brand.danger,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
  },
  confirmText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.onAccent,
  },
  destructiveButtonText: {
    color: Brand.surface,
  },
});
