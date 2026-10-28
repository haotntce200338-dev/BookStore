import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';

test('renders bookstore brand or heading', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const brandElements = screen.getAllByText(/BookStore/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
