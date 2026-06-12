import { getSchemaForType } from './schemas';
export function validateSectionProps(type, props) {
    const schema = getSchemaForType(type);
    if (!schema) {
        return { success: false, error: `Unknown section type "${type}"` };
    }
    const result = schema.safeParse(props);
    if (!result.success) {
        return {
            success: false,
            error: result.error.issues.map((issue) => issue.message).join('; '),
        };
    }
    return { success: true, data: result.data };
}
