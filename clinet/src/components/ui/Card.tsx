import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof Spacing;
  onPress?: () => void;
}

export const Card = ({
  children,
  style,
  variant = 'elevated',
  padding = 'md',
  onPress,
}: CardProps) => {
  const baseStyle: ViewStyle = {
    borderRadius: BorderRadius.lg,
    padding: Spacing[padding],
  };

  let backgroundColor = Colors.surface;
  let borderWidth = 0;
  let borderColor = 'transparent';
  let shadow: any = {};

  switch (variant) {
    case 'elevated':
      backgroundColor = Colors.surface;
      shadow = Shadows.medium;
      break;
    case 'outlined':
      backgroundColor = Colors.surface;
      borderWidth = 1;
      borderColor = Colors.border;
      break;
    case 'filled':
      backgroundColor = Colors.background;
      break;
  }

  const cardStyles = StyleSheet.flatten([
    baseStyle,
    {
      backgroundColor,
      borderWidth,
      borderColor,
      ...shadow,
    },
    style,
  ]);

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};