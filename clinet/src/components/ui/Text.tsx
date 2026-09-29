import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface StyledTextProps {
  children: React.ReactNode;
  variant?: keyof typeof Typography;
  style?: TextStyle;
  color?: string;
  weight?: TextStyle['fontWeight'];
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const StyledText = ({
  children,
  variant = 'body1',
  style,
  color = Colors.text,
  weight,
  align,
  numberOfLines,
}: StyledTextProps) => {
  const baseStyle = Typography[variant] || Typography.body1;
  const textStyles = StyleSheet.flatten([
    baseStyle,
    { color, fontWeight: weight, textAlign: align },
    style,
  ]);

  return <Text style={textStyles} numberOfLines={numberOfLines}>{children}</Text>;
};