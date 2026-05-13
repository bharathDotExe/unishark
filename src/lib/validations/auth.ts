import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'investor']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const studentProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  college: z.string().min(1, 'College is required'),
  year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni']),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  contactNumber: z.string().optional(),
  city: z.string().min(1, 'City is required'),
});

export const studentSkillsSchema = z.object({
  skills: z.array(z.string()).min(1, 'Select at least one skill').max(12),
  startupInterests: z.array(z.string()).min(1, 'Select at least one interest').max(12),
  industriesInterest: z.string().optional(),
});

export const investorProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  companyFundName: z.string().optional(),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional(),
  contactNumber: z.string().min(10, 'Contact number is required'),
  city: z.string().min(1, 'City is required'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL'),
});

export const investorInvestmentSchema = z.object({
  investmentExperience: z.enum(['First-time', '1-5', '5-20', '20+']),
  ticketSizeMin: z.number().min(100000, 'Minimum ticket must be at least ₹1L'),
  ticketSizeMax: z.number().max(1000000000, 'Maximum ticket too large'),
  preferredStages: z.array(z.string()).min(1, 'Select at least one stage'),
  investmentSectors: z.array(z.string()).min(1, 'Select at least one sector'),
  preferredSectors: z.string().optional(),
}).refine((d) => d.ticketSizeMin <= d.ticketSizeMax, {
  message: 'Minimum ticket must be ≤ Maximum ticket',
  path: ['ticketSizeMax'],
});

export const investorVerificationSchema = z.object({
  totalInvestmentsCount: z.number().min(0),
  referenceFounder1Name: z.string().min(2, 'Reference name required'),
  referenceFounder1Email: z.string().email('Invalid email'),
  referenceFounder2Name: z.string().min(2, 'Reference name required'),
  referenceFounder2Email: z.string().email('Invalid email'),
  pastInvestments: z.string().optional(),
});
