import { z } from "zod";

export const PrivacyEnum = z.enum(["private", "public", "invite"], {
  invalid_type_error: "Invalid privacy type",
  required_error: "Privacy setting is required",
});
export const detailsFormSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "name must be at least 2 characters.",
      })
      .max(30),
    description: z
      .string()
      .max(100, {
        message: "Description must be less than 100 characters.",
      })
      .optional(),
    writePrivacy: PrivacyEnum,
    readPrivacy: PrivacyEnum,
  })
  .superRefine((data, ctx) => {
    if (data.readPrivacy === "invite" && data.writePrivacy === "public") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "You can't have a public write privacy with an invite read privacy.",
        path: ["writePrivacy"],
      });
      return false;
    } else if (
      data.readPrivacy === "private" &&
      data.writePrivacy !== "private"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "You can't have a non-private write privacy with a private read privacy.",
        path: ["writePrivacy"],
      });
      return false;
    }
  });
