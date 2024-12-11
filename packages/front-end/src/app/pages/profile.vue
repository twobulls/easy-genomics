<script setup lang="ts">
  import { FormError } from '#ui/types';
  import { FirstNameSchema, LastNameSchema, ProfileDetails, ProfileDetailsSchema } from '@FE/types/user';

  const userStore = useUserStore();

  const state = ref<ProfileDetails>({
    firstName: userStore.currentUserDetails.firstName || '',
    lastName: userStore.currentUserDetails.lastName || '',
  });

  const allowSubmit = computed<boolean>(() => {
    const formDirty =
      state.value.firstName !== userStore.currentUserDetails.firstName ||
      state.value.lastName !== userStore.currentUserDetails.lastName;

    const formValid = ProfileDetailsSchema.safeParse(state.value).success;

    return formDirty && formValid;
  });

  async function onSubmit(): Promise<void> {
    useUiStore().setRequestPending('editProfileDetails');

    try {
      // TODO: call api to set new names
      // useToastStore().success('Your Profile has been updated');
      useToastStore().info('Updating user details is not yet implemented');
      // TODO: call api to refresh user names
    } catch (e) {
      console.error('error while updating user details:', e);
    }

    useUiStore().setRequestComplete('editProfileDetails');
  }
</script>

<template>
  <div class="mx-auto mt-24 w-[408px]">
    <EGPageHeader title="Edit Your Profile" :show-back="false" />

    <div class="border-stroke-light mb-12 flex flex-row items-center gap-3 rounded border bg-white p-4">
      <EGInitialsCircle />

      <div class="flex flex-col">
        <div class="pb-1 text-sm font-medium">{{ userStore.currentUserDisplayName }}</div>
        <div class="text-muted text-xs font-normal">{{ userStore.currentUserDetails.email }}</div>
      </div>
    </div>

    <UForm :schema="ProfileDetailsSchema" :state="state" @submit="onSubmit">
      <EGFormGroup label="First Name" name="firstName" eager-validation required>
        <EGInput v-model="state.firstName" required />
      </EGFormGroup>

      <EGFormGroup label="Last Name" name="lastName" eager-validation required>
        <EGInput v-model="state.lastName" required />
      </EGFormGroup>

      <div class="flex flex-row items-center justify-between">
        <a href="/forgot-password" class="text-primary underline">Reset password</a>
        <EGButton type="submit" label="Save Changes" :disabled="!allowSubmit" />
      </div>
    </UForm>
  </div>
</template>
