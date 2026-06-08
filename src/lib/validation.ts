const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;
const URL_MAX = 2048;

export type ValidationError = { field: string; message: string };

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || !email.trim()) return "Email is required";
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return "Email is too long";
  if (!EMAIL_REGEX.test(trimmed)) return "Invalid email format";
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || !password) return "Password is required";
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (password.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters`;
  return null;
}

export function validateRequiredString(value: unknown, fieldName: string, maxLen = NAME_MAX): string | null {
  if (typeof value !== "string" || !value.trim()) return `${fieldName} is required`;
  const trimmed = value.trim();
  if (trimmed.length > maxLen) return `${fieldName} must be at most ${maxLen} characters`;
  return null;
}

export function validateOptionalString(value: unknown, fieldName: string, maxLen: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return `${fieldName} must be a string`;
  const trimmed = value.trim();
  if (trimmed.length > maxLen) return `${fieldName} must be at most ${maxLen} characters`;
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

const VALID_ROLES = ["STUDENT", "INSTRUCTOR"] as const;
export function validateRole(role: unknown): string | null {
  if (role === undefined || role === null) return null;
  if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) return "Invalid role";
  return null;
}

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export function validateProgressStatus(status: unknown): string | null {
  if (typeof status !== "string") return "Status is required";
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) return "Invalid status";
  return null;
}

const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export function validateDifficulty(difficulty: unknown): string | null {
  if (difficulty === null || difficulty === undefined) return null;
  if (!VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])) return "Invalid difficulty level";
  return null;
}

const VALID_LESSON_TYPES = ["VIDEO", "ARTICLE", "READING", "TEXT", "QUIZ", "ASSIGNMENT"] as const;
export function validateLessonType(type: unknown): string | null {
  if (type === null || type === undefined) return null;
  if (!VALID_LESSON_TYPES.includes(type as typeof VALID_LESSON_TYPES[number])) return "Invalid lesson type";
  return null;
}

const VALID_RESOURCE_TYPES = ["PDF", "VIDEO", "LINK", "ARTICLE", "FILE"] as const;
export function validateResourceType(type: unknown): string | null {
  if (!type) return null;
  if (!VALID_RESOURCE_TYPES.includes(type as typeof VALID_RESOURCE_TYPES[number])) return "Invalid resource type";
  return null;
}

const VALID_VR_FORMATS = ["VR_SCENE", "AR_POSTER", "360_VIDEO", "MODEL_VIEWER"] as const;
export function validateVrFormat(format: unknown): string | null {
  if (format === null || format === undefined) return null;
  if (!VALID_VR_FORMATS.includes(format as typeof VALID_VR_FORMATS[number])) return "Invalid VR format";
  return null;
}

export function validateScore(score: unknown): string | null {
  if (score === undefined || score === null) return null;
  if (typeof score !== "number" || isNaN(score)) return "Score must be a number";
  if (score < 0 || score > 100) return "Score must be between 0 and 100";
  return null;
}

export function validateUrl(url: unknown): string | null {
  if (url === undefined || url === null) return null;
  if (typeof url !== "string") return "URL must be a string";
  if (url.length > URL_MAX) return "URL is too long";
  try { new URL(url); } catch { return "Invalid URL format"; }
  return null;
}

export function validateId(id: unknown, name = "ID"): string | null {
  if (typeof id !== "string" || !id.trim()) return `${name} is required`;
  return null;
}

export function validateEstimatedHours(hours: unknown): string | null {
  if (hours === undefined || hours === null) return null;
  if (typeof hours !== "number" || isNaN(hours)) return "Estimated hours must be a number";
  if (hours < 0 || hours > 1000) return "Estimated hours must be between 0 and 1000";
  return null;
}

export function validatePublished(published: unknown): string | null {
  if (published === undefined || published === null) return null;
  if (typeof published !== "boolean") return "Published must be a boolean";
  return null;
}

export function validateBoolean(value: unknown, name: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "boolean") return `${name} must be a boolean`;
  return null;
}

export function validateInteger(value: unknown, name: string, min: number, max: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) return `${name} must be an integer`;
  if (value < min || value > max) return `${name} must be between ${min} and ${max}`;
  return null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
