import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  MapPin,
  MoreHorizontal,
  Settings,
  Share2,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeartButton } from '@/components/shop/heart-button';
import { IconButton } from '@/components/shop/icon-button';
import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, PixelBorder, PixelFonts } from '@/constants/theme';

interface HomeProps {
  variant: 'home';
  addressLabel?: string;
  address: string;
  hasNotification?: boolean;
  onAddressPress?: () => void;
  onSettings?: () => void;
  onNotification?: () => void;
}

interface ListProps {
  variant: 'list';
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  /** ต้องส่ง onOptions มาด้วยถึงจะแสดงปุ่มตัวเลือก */
  showOptions?: boolean;
  showFilter?: boolean;
  onFilter?: () => void;
  onOptions?: () => void;
}

type Props = HomeProps | ListProps;

/** Reusable top header. `home` and `list` variants (detail uses FloatingHeader). */
export function TopBar(props: Props) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + 8;

  if (props.variant === 'home') {
    const addressContent = (
      <>
        <View style={styles.addressLabelRow}>
          <MapPin size={12} color={Brand.textSecondary} strokeWidth={2} />
          <Text style={styles.addressLabel}>{props.addressLabel ?? 'จัดส่งไปที่'}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {props.address}
        </Text>
      </>
    );

    return (
      <View style={[styles.container, { paddingTop }]}>
        <IconButton variant="favorite" onPress={props.onSettings} accessibilityLabel="ตั้งค่า">
          <Settings size={20} color={Brand.text} strokeWidth={1.75} />
        </IconButton>
        {props.onAddressPress ? (
          <PressableScale style={styles.homeCenter} onPress={props.onAddressPress}>
            {addressContent}
          </PressableScale>
        ) : (
          <View style={styles.homeCenter}>{addressContent}</View>
        )}
        <IconButton
          onPress={props.onNotification}
          showBadgeDot={props.hasNotification}
          accessibilityLabel="การแจ้งเตือน">
          <Bell size={20} color={Brand.text} strokeWidth={1.75} />
        </IconButton>
      </View>
    );
  }

  return <ListBar {...props} paddingTop={paddingTop} />;
}

function ListBar({
  title,
  showBack,
  onBack,
  showOptions = false,
  showFilter,
  onFilter,
  onOptions,
  paddingTop,
}: ListProps & { paddingTop: number }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.listLeft}>
        {showBack ? (
          <IconButton onPress={handleBack} accessibilityLabel="ย้อนกลับ">
            <ChevronLeft size={22} color={Brand.text} strokeWidth={2} />
          </IconButton>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.listRight}>
        {showFilter ? (
          <IconButton onPress={onFilter} accessibilityLabel="ตัวกรอง">
            <SlidersHorizontal size={18} color={Brand.text} strokeWidth={2} />
          </IconButton>
        ) : null}
        {showOptions && onOptions ? (
          <IconButton onPress={onOptions} accessibilityLabel="ตัวเลือก">
            <MoreHorizontal size={20} color={Brand.text} strokeWidth={2} />
          </IconButton>
        ) : null}
      </View>
    </View>
  );
}

/** Floating header used on the product detail screen (overlays the image). */
export function FloatingHeader({
  productId,
  productName,
}: {
  productId: string;
  /** Included in the shared text/link when the user taps the share button. */
  productName?: string;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onShare = async () => {
    const url = `myprofileappnindam://product/${productId}`;
    const message = productName ? `${productName}\n${url}` : url;

    if (Platform.OS === 'web') {
      const nav = (globalThis as { navigator?: Navigator }).navigator as
        | (Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> })
        | undefined;
      if (nav?.share) {
        await nav.share({ title: productName, text: message, url });
      }
      return;
    }

    await Share.share({ message });
  };

  return (
    <View style={[styles.floating, { top: insets.top + 8 }]} pointerEvents="box-none">
      <IconButton variant="floating" onPress={() => router.back()} accessibilityLabel="ย้อนกลับ">
        <ChevronLeft size={22} color={Brand.text} strokeWidth={2} />
      </IconButton>
      <View style={styles.floatingRight}>
        <HeartButton productId={productId} size={20} />
        <IconButton variant="floating" onPress={onShare} accessibilityLabel="แชร์">
          <Share2 size={18} color={Brand.text} strokeWidth={2} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
    backgroundColor: Brand.skyBlue,
    borderBottomWidth: PixelBorder.thick,
    borderBottomColor: Brand.divider,
  },
  homeCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressLabel: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
  address: {
    fontSize: 14,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  listLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
    flexShrink: 1,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floating: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  floatingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
