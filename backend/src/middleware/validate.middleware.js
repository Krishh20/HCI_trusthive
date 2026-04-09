/**
 * @param {import("zod").ZodSchema} schema
 * @param {"body" | "query"} source
 */
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const raw = source === "query" ? req.query : req.body;
    const result = schema.safeParse(raw);
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      return res.status(400).json({
        message: "Validation failed",
        errors: fieldErrors,
        formErrors,
      });
    }
    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };
}
