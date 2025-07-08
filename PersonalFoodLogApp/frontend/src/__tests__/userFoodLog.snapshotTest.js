import 'react-native';
import UserFoodLogScreen from '../screens/UserFoodLogScreen';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';

test('renders UserFoodLog correctly', () => {
    const tree = render(
        <NavigationContainer>
            <UserFoodLogScreen navigation={{ navigate: jest.fn() }} />
        </NavigationContainer>
    );
    expect(tree).toMatchSnapshot();
});