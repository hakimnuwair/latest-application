import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(60, 'At most 60 characters'),
});
export type CategoryForm = z.infer<typeof categoryFormSchema>;
