import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      style,
      disabled,
      onPress,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseButtonStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...(fullWidth ? { width: '100%' } : {}),
    };

    const baseTextStyle: TextStyle = {
      ...Typography.button,
      textAlign: 'center',
    };

    // Size variants
    let sizeButtonStyle: ViewStyle = {};
    let sizeTextStyle: TextStyle = {};

    switch (size) {
      case 'sm':
        sizeButtonStyle = {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          minHeight: 32,
        };
        sizeTextStyle = { fontSize: 12 };
        break;
      case 'lg':
        sizeButtonStyle = {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          minHeight: 52,
        };
        sizeTextStyle = { fontSize: 16 };
        break;
      default: // md
        sizeButtonStyle = {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          minHeight: 44,
        };
        sizeTextStyle = { fontSize: 14 };
        break;
    }

    // Color/Variant styles
    let backgroundColor = Colors.primary;
    let textColor = Colors.textOnPrimary;
    let borderColor = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'secondary':
        backgroundColor = Colors.primaryLight;
        textColor = Colors.primary;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderColor = Colors.primary;
        borderWidth = 1.5;
        textColor = Colors.primary;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        textColor = Colors.primary;
        break;
      default: // primary
        backgroundColor = Colors.primary;
        textColor = Colors.textOnPrimary;
        break;
    }

    if (isDisabled) {
      backgroundColor = Colors.disabled;
      textColor = Colors.placeholder;
      borderColor = 'transparent';
    }

    const buttonStyles = StyleSheet.flatten([
      baseButtonStyle,
      sizeButtonStyle,
      {
        backgroundColor,
        borderColor,
        borderWidth,
      },
      style,
    ]);

    const textStyles = StyleSheet.flatten([
      baseTextStyle,
      sizeTextStyle,
      { color: textColor },
    ]);

    return (
      <TouchableOpacity
        ref={ref as any}
        style={buttonStyles}
        disabled={isDisabled}
        onPress={onPress}
        activeOpacity={isDisabled ? 1 : 0.8}
        {...props}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: Spacing.sm }}>
              <Text style={{ color: textColor }}>⏳</Text>
            </View>
            <Text style={textStyles}>{title}</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {leftIcon && <View style={{ marginRight: Spacing.sm }}>{leftIcon}</View>}
            <Text style={textStyles}>{title}</Text>
            {rightIcon && <View style={{ marginLeft: Spacing.sm }}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';