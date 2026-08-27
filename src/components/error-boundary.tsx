import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

type BoundaryProps = Props & {
  styles: ReturnType<typeof makeStyles>;
};

class ErrorBoundaryCore extends Component<BoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { styles } = this.props;

    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>เกิดข้อผิดพลาด</Text>
            <Text style={styles.description}>
              แอปพบปัญหาบางอย่าง กรุณาลองใหม่อีกครั้ง
            </Text>
            <PressableScale
              accessibilityRole="button"
              onPress={this.handleRetry}
              style={styles.button}>
              <Text style={styles.buttonText}>ลองใหม่</Text>
            </PressableScale>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: Props) {
  const styles = useStyles(makeStyles);
  return <ErrorBoundaryCore styles={styles}>{children}</ErrorBoundaryCore>;
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Brand.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: 24,
    borderWidth: 3,
    borderColor: Brand.divider,
    borderRadius: Radius.card,
    backgroundColor: Brand.surface,
  },
  title: {
    color: Brand.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    color: Brand.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    minWidth: 140,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: Brand.divider,
    borderRadius: Radius.md,
    backgroundColor: Brand.accent,
  },
  buttonText: {
    color: Brand.onAccent,
    fontSize: 16,
    fontWeight: '700',
  },
});
