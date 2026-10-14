export type CreateWorkflowFileField = 'workflowZipFile' | 'parameterTemplateFile';

export type CreateWorkflowFormValidation = {
  validate: (path: CreateWorkflowFileField, opts: { silent: boolean }) => Promise<unknown>;
};

/**
 * Native file inputs are not UForm controls, so choosing a file does not emit a
 * form change event. The parameter selector is already FILE on load, so the
 * user never changes it either. Revalidate the file field directly; `silent`
 * keeps UForm from throwing while other fields are still invalid.
 */
export async function revalidateCreateWorkflowFileField(
  form: CreateWorkflowFormValidation | null | undefined,
  path: CreateWorkflowFileField,
): Promise<void> {
  await form?.validate(path, { silent: true });
}
