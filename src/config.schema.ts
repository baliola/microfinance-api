import z from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z.string().default('development'),
  CORS_URL: z
    .string({ required_error: 'CORS URL Required.' })
    .min(1, 'CORS_URL cannot be empty')
    .refine(
      (value) => {
        const urls = value.split(',');
        return urls.every((url) => {
          try {
            new URL(url.trim());
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            return false;
          }
        });
      },
      {
        message: 'Invalid URL format in CORS_URL',
      },
    ),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
  HOST: z.string().default('localhost'),
  WEB_URL: z.string().default('http'),
});

export const validatedConfig = () => {
  const parsed = configValidationSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  return parsed.data; // Return validated environment variables
};
