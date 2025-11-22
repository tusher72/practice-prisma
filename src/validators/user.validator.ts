import { z } from "zod";

import { ContainerStyleEnum } from "../enums/container-style.enum";
import { RadiusEnum } from "../enums/radius.enum";
import { ThemeModeEnum } from "../enums/theme-mode.enum";
import { UserStatusEnum } from "../enums/user-status.enum";

/**
 * Schema for validating hex color code format.
 *
 * @constant {z.ZodString}
 */
const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code");

/**
 * Schema for validating user theme configuration.
 *
 * @constant {z.ZodObject}
 */
const themeSchema = z.object({
    primaryColor: hexColorSchema,
    secondary: hexColorSchema,
    themeMode: z.nativeEnum(ThemeModeEnum),
    containerStyle: z.nativeEnum(ContainerStyleEnum),
    radius: z.nativeEnum(RadiusEnum),
    font: z.string().min(1).max(100),
});

/**
 * Schema for validating user configuration.
 *
 * @constant {z.ZodObject}
 */
const userConfigSchema = z.object({
    tags: z.array(z.string().min(1).max(50)).default([]),
    active: z.nativeEnum(UserStatusEnum).default(UserStatusEnum.ACTIVE),
    theme: themeSchema.default({
        primaryColor: "#3b82f6",
        secondary: "#8b5cf6",
        themeMode: ThemeModeEnum.LIGHT,
        containerStyle: ContainerStyleEnum.BORDERED,
        radius: RadiusEnum.MD,
        font: "Inter",
    }),
});

/**
 * Schema for validating user creation requests.
 *
 * Validates:
 * - name: Non-empty string, 1-255 characters, trimmed
 * - email: Valid email format, trimmed and lowercased
 * - config: Optional user configuration object
 *
 * @constant {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Valid request body:
 * {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   config: {
 *     tags: ["work", "personal"],
 *     active: "active",
 *     theme: { ... }
 *   }
 * }
 * ```
 */
export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255).trim(),
        email: z.string().email().trim().toLowerCase(),
        config: userConfigSchema.optional(),
    }),
});

/**
 * Schema for validating user update requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 * - body.name: Optional, non-empty string, 1-255 characters, trimmed
 * - body.email: Optional, valid email format, trimmed and lowercased
 * - body.config: Optional user configuration object
 * - Requires at least one field in body to be provided
 *
 * @constant {z.ZodObject}
 */
export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z
        .object({
            name: z.string().min(1).max(255).trim().optional(),
            email: z.string().email().trim().toLowerCase().optional(),
            config: userConfigSchema.optional(),
        })
        .refine(
            (data: { name?: string; email?: string; config?: z.infer<typeof userConfigSchema> }) =>
                Object.keys(data).length > 0,
            {
                message: "At least one field must be provided for update",
            },
        ),
});

/**
 * Schema for validating get user by ID requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const getUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});

/**
 * Schema for validating user deletion requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});
