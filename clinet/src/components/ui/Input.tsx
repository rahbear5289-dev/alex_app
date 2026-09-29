import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      style,
      placeholder,
      value,
      onChangeText,
      disabled = false,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const inputBackground = disabled ? Colors.background : Colors.surface;
    const borderColor = hasError ? Colors.error : Colors.border;

    const containerStyles = StyleSheet.flatten([
      styles.container,
      { borderColor },
      containerStyle,
    ]);

    const inputStyles = StyleSheet.flatten([
      styles.input,
      { backgroundColor: inputBackground, color: Colors.text },
      style,
    ]);

    return (
      <View style={containerStyles}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputWrapper}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={inputStyles}
            placeholder={placeholder}
            placeholderTextColor={Colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            selectionColor={Colors.primary}
            {...props}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {hasError && <Text style={styles.errorText}>{error}</Text>}
        {!hasError && helperText && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  label: {
    ...Typography.body2,
    color: Colors.text,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    ...Typography.body1,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});