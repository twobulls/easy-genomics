import { z } from 'zod';
import { useOrgForm } from '#imports';
const { orgDetailsFormSchema } = useOrgForm();

export type OrgDetailsFormSchema = z.infer<typeof orgDetailsFormSchema>;
