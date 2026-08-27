import { useRouter } from 'expo-router';
import { LogIn, ShieldCheck, ShoppingBag, UserPlus } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { PixelBorder, Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';

export default function WelcomeScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enterGuestMode } = useAuth();

  const continueAsGuest = () => {
    enterGuestMode();
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
      ]}>
      <View style={styles.heading}>
        <View style={styles.logo}>
          <ShoppingBag size={34} color={Brand.text} strokeWidth={2.5} />
        </View>
        <Text style={styles.eyebrow}>ขจี อิเล็กทริก</Text>
        <Text style={styles.title}>ยินดีต้อนรับ</Text>
        <Text style={styles.subtitle}>เลือกวิธีที่คุณต้องการเริ่มใช้งาน</Text>
      </View>

      <View style={styles.actions}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="เข้าสู่ระบบ"
          style={[styles.card, styles.primaryCard]}
          onPress={() => router.push('/(auth)/login')}>
          <View style={styles.iconBox}>
            <LogIn size={24} color={Brand.text} strokeWidth={2} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>เข้าสู่ระบบ</Text>
            <Text style={styles.cardDescription}>สำหรับลูกค้าที่มีบัญชีอยู่แล้ว</Text>
          </View>
        </PressableScale>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="สมัครสมาชิก"
          style={styles.card}
          onPress={() => router.push('/(auth)/register')}>
          <View style={[styles.iconBox, styles.registerIcon]}>
            <UserPlus size={24} color={Brand.text} strokeWidth={2} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>สมัครสมาชิก</Text>
            <Text style={styles.cardDescription}>สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง</Text>
          </View>
        </PressableScale>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="เข้าชมแบบผู้เยี่ยมชม"
          style={styles.card}
          onPress={continueAsGuest}>
          <View style={[styles.iconBox, styles.guestIcon]}>
            <ShoppingBag size={24} color={Brand.text} strokeWidth={2} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>เข้าชมแบบผู้เยี่ยมชม</Text>
            <Text style={styles.cardDescription}>เลือกดูสินค้าได้โดยไม่ต้องเข้าสู่ระบบ</Text>
          </View>
        </PressableScale>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="เข้าสู่ระบบแอดมิน"
          style={[styles.card, styles.adminCard]}
          onPress={() => router.push('/(auth)/login?intent=admin')}>
          <View style={[styles.iconBox, styles.adminIcon]}>
            <ShieldCheck size={24} color={Brand.text} strokeWidth={2} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>เข้าสู่ระบบแอดมิน</Text>
            <Text style={styles.cardDescription}>สำหรับผู้ดูแลระบบชาเจ อิเล็กทริก</Text>
          </View>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heading: {
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    marginBottom: 20,
  },
  eyebrow: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 6,
    color: Brand.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: Brand.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    marginTop: 32,
    gap: 14,
  },
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  primaryCard: {
    backgroundColor: Brand.accent,
  },
  adminCard: {
    backgroundColor: Brand.surfaceDeep,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  registerIcon: {
    backgroundColor: Brand.skyBlue,
  },
  guestIcon: {
    backgroundColor: Brand.tan,
  },
  adminIcon: {
    backgroundColor: Brand.saleBg,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: Brand.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 3,
    color: Brand.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
