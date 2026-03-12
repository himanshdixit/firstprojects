import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';

const mockPush = jest.fn();
const mockLogin = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

jest.mock('@/hooks/useAuth', () => {
  return () => ({
    login: mockLogin,
    register: jest.fn(),
  });
});

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form fields', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits credentials and redirects on success', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
