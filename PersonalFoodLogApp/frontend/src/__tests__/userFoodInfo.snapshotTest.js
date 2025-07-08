import 'react-native';
import UserInfoLogScreen from '../screens/UserInfoFormScreen';
import { render } from '@testing-library/react-native';

test('renders UserInfoLog correctly', () => {
    const tree = render(<UserInfoLogScreen navigation={{ navigate: jest.fn() }} />);
    expect(tree).toMatchSnapshot();
});