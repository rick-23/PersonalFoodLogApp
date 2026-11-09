import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Platform, Alert } from 'react-native';
import { colors } from '../theme';

export const Button = ({ title, onPress, variant = 'primary', disabled, style, accessibilityLabel }) => (
    <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
            styles.button,
            variant === 'secondary' && styles.buttonSecondary,
            variant === 'danger' && styles.buttonDanger,
            (pressed || disabled) && { opacity: 0.6 },
            style,
        ]}
    >
        <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{title}</Text>
    </Pressable>
);

export const Field = ({ label, error, children }) => (
    <View style={styles.field}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {children}
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
);

export const Input = React.forwardRef((props, ref) => (
    <TextInput ref={ref} placeholderTextColor="#999" {...props} style={[styles.input, props.style]} />
));
Input.displayName = 'Input';

export const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

/** Yes/no confirmation that also works on web (where Alert buttons aren't supported). */
export const confirm = (title, message) => {
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    return new Promise((resolve) => {
        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ]);
    });
};

export const notify = (title, message) => {
    if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
    else Alert.alert(title, message);
};

export const styles = StyleSheet.create({
    screen: { flexGrow: 1, padding: 16, backgroundColor: colors.background },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 6,
    },
    buttonSecondary: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary },
    buttonDanger: { backgroundColor: colors.danger },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    buttonTextSecondary: { color: colors.primaryDark },
    field: { marginBottom: 14 },
    label: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
    input: {
        backgroundColor: '#fff',
        borderColor: colors.border,
        borderWidth: 1.5,
        borderRadius: 10,
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text,
    },
    error: { color: colors.danger, marginTop: 4 },
    card: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: { fontSize: 26, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 15, color: colors.muted },
    muted: { color: colors.muted },
});
