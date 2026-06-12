import { getSchemaForType } from './section-schemas';
import type { ValidateSectionPropsResult } from './types';

export function validateSectionProps(
  type: string,
  props: unknown,
): ValidateSectionPropsResult {
  const schema = getSchemaForType(type);
  if (!schema) {
    return { success: false, error: `Unknown section type "${type}"` };
  }

  const result = schema.safeParse(props);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((issue: { message: string }) => issue.message).join('; '),
    };
  }

  return { success: true, data: result.data };
}
