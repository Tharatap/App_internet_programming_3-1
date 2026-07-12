import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

interface Props {
  uri?: string;
  style?: ViewStyle;
  borderRadius?: number;
}

/**
 * Image with a grey placeholder background. The grey block shows while the
 * remote image is loading (skeleton) and stays visible as a fallback if the
 * image fails to load or there is no `uri` (Phase 1 mock data).
 */
export function SkeletonImage({ uri, style, borderRadius = 0 }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  return (
    <View style={[styles.base, { borderRadius }, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          onError={() => setFailed(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Brand.surfaceDeep,
    overflow: 'hidden',
  },
});
