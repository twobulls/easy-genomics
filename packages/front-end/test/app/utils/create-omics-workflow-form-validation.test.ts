import { revalidateCreateWorkflowFileField } from '../../../src/app/utils/create-omics-workflow-form-validation';

describe('revalidateCreateWorkflowFileField', () => {
  it('revalidates the parameter file while the preselected FILE option stays unchanged', async () => {
    const validate = jest.fn().mockResolvedValue(false);

    await revalidateCreateWorkflowFileField({ validate }, 'parameterTemplateFile');

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith('parameterTemplateFile', { silent: true });
  });

  it('revalidates the workflow ZIP after that file input changes', async () => {
    const validate = jest.fn().mockResolvedValue(true);

    await revalidateCreateWorkflowFileField({ validate }, 'workflowZipFile');

    expect(validate).toHaveBeenCalledWith('workflowZipFile', { silent: true });
  });

  it('does nothing when the form is not mounted yet', async () => {
    await expect(revalidateCreateWorkflowFileField(null, 'parameterTemplateFile')).resolves.toBeUndefined();
    await expect(revalidateCreateWorkflowFileField(undefined, 'parameterTemplateFile')).resolves.toBeUndefined();
  });
});
