import 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../context/authContext';

test('renders Profile correctly', () => {
    const tree = render(
        <AuthProvider>
            <ProfileScreen navigation={{ navigate: jest.fn() }} />
        </AuthProvider>
    );
    expect(tree).toMatchSnapshot();
});