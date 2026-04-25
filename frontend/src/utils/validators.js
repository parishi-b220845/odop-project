export const validators = {
  phone: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s+\-()]/g, '').replace(/^91/, '')),
  pincode: (v) => /^\d{6}$/.test(v.trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  name: (v) => v.trim().length >= 2,
  password: (v) => v.length >= 6,
};

export const messages = {
  phone: 'Enter a valid 10-digit Indian mobile number',
  pincode: 'Pincode must be 6 digits',
  email: 'Enter a valid email address',
  name: 'Name must be at least 2 characters',
  password: 'Password must be at least 6 characters',
};
