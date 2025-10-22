import { z } from 'zod';

const ExerciseSchema = z.union([
  z.number(),
  z.object({
    id: z.number(),
    sets: z.number().optional(),
    reps: z.number().optional(),
  }),
]);

const SessionSchema = z.object({
  name: z.string(),
  exercises: z.array(ExerciseSchema),
});

export const LlmProgramSchema = z.object({
  template: z.string(),
  sessions: z.array(SessionSchema),
});
