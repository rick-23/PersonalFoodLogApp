import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/authContext';
import { Button, Card, styles } from '../components/ui';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    return (
        <ScrollView contentContainerStyle={styles.screen}>
            <Text style={[styles.title, { marginBottom: 16 }]}>Profile</Text>
            <Card>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.subtitle}>{user?.email || 'Not available'}</Text>
            </Card>
            <Button title="Edit personal info" variant="secondary" onPress={() => navigation?.navigate('PersonalInfo')} />
            <Button title="Meal reminders" variant="secondary" onPress={() => navigation?.navigate('Reminders')} />
            <View style={{ height: 24 }} />
            <Button title="Logout" variant="danger" onPress={logout} />
        </ScrollView>
    );
};

export default ProfileScreen;
