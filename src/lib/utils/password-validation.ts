export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

/**
 * Strong password requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate password strength as a percentage (0-100)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0
  const checks = [
    password.length >= 12,
    password.length >= 16,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    password.length >= 20,
    /[A-Z].*[A-Z]/.test(password), // Multiple uppercase
    /[0-9].*[0-9]/.test(password), // Multiple numbers
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?].*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password), // Multiple special chars
  ]

  checks.forEach((check) => {
    if (check) strength += 10
  })

  return Math.min(strength, 100)
}
