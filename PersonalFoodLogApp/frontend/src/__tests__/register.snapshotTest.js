import 'react-native';
import RegisterScreen from '../screens/RegisterScreen';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../context/authContext';

test('renders register correctly', () => {
    const tree = render(
        <AuthProvider>
            <RegisterScreen navigation={{ navigate: jest.fn() }} />
        </AuthProvider>
    );
    expect(tree).toMatchSnapshot();
});