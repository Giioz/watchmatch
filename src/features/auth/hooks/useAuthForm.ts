import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabaseClient';

export type AuthErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export function useAuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        router.replace('/');
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  const toggleMode = () => {
    setIsSignUp((current) => !current);
    setErrors({});
    setStatusMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const newErrors: AuthErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setStatusMessage(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const authResponse = isSignUp
        ? await supabase.auth.signUp({
            email: normalizedEmail,
            password,
          })
        : await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

      if (authResponse.error) {
        setErrors({ form: authResponse.error.message });
        return;
      }

      if (isSignUp && !authResponse.data.session) {
        setStatusMessage('Check your email to confirm your account, then sign in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        return;
      }

      router.replace('/');
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return {
    router,
    isSignUp,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    errors,
    statusMessage,
    toggleMode,
    handleAuthSubmit,
  };
}
