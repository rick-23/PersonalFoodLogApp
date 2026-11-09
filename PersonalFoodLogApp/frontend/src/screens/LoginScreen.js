import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/authContext';
import { Button, Field, Input, styles } from '../components/ui';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setBusy(true);
        try {
            // On success the app switches to the main screens by itself.
            await login(email.trim(), password);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={[styles.screen, { justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
                <Text style={[styles.title, { textAlign: 'center' }]}>Personal Food Log</Text>
                <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 24 }]}>Sign in to log your meals</Text>
                <Field label="Email">
                    <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                    />
                </Field>
                <Field label="Password">
                    <Input
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        onSubmitEditing={handleLogin}
                    />
                </Field>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title={busy ? 'Signing in…' : 'Login'} onPress={handleLogin} disabled={busy || !email || !password} accessibilityLabel="login-button" />
                <View style={{ height: 8 }} />
                <Button title="Create an account" variant="secondary" onPress={() => navigation.navigate('Register')} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
