import 'react-native';
import LoginScreen from '../screens/LoginScreen';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../context/authContext';

test('renders login correctly', () => {
    const tree = render(
        <AuthProvider>
            <LoginScreen navigation={{ navigate: jest.fn() }} />
        </AuthProvider>
    );
    expect(tree).toMatchSnapshot();
});