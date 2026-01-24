import { useState, useCallback } from 'react';
import { sanitizeInput, isValidEmail, isValidUrl, isDangerousContent } from '../utils/security';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [values, setValues] = useState<{ [key: string]: string }>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Санитизируем ввод
    const sanitizedValue = sanitizeInput(value);

    // Проверяем на опасный контент
    if (isDangerousContent(sanitizedValue)) {
      return 'Контент содержит потенциально опасные элементы';
    }

    // Обязательное поле
    if (rule.required && !sanitizedValue.trim()) {
      return 'Это поле обязательно для заполнения';
    }

    // Минимальная длина
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      return `Минимальная длина: ${rule.minLength} символов`;
    }

    // Максимальная длина
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      return `Максимальная длина: ${rule.maxLength} символов`;
    }

    // Паттерн
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      return 'Неверный формат';
    }

    // Кастомная валидация
    if (rule.custom) {
      return rule.custom(sanitizedValue);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name] || '');
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, values, validateField]);

  const setValue = useCallback((name: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Валидируем поле при изменении
    const error = validateField(name, sanitizedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const getFieldProps = useCallback((name: string) => ({
    value: values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(name, e.target.value);
    },
    error: errors[name]
  }), [values, errors, setValue]);

  return {
    values,
    errors,
    setValue,
    validateField,
    validateForm,
    getFieldProps,
    isValid: Object.values(errors).every(error => !error)
  };
};

// Предустановленные правила валидации
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => !isValidEmail(value) ? 'Неверный формат email' : null
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    custom: (value: string) => {
      if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
      if (!/(?=.*[a-z])/.test(value)) return 'Пароль должен содержать строчные буквы';
      if (!/(?=.*[A-Z])/.test(value)) return 'Пароль должен содержать заглавные буквы';
      if (!/(?=.*\d)/.test(value)) return 'Пароль должен содержать цифры';
      return null;
    }
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: false,
    maxLength: 1000
  },
  url: {
    required: false,
    custom: (value: string) => value && !isValidUrl(value) ? 'Неверный формат URL' : null
  }
};
