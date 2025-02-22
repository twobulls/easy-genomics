<script setup lang="ts">
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user-details';
  import { LaboratoryRolesEnum, LaboratoryRolesEnumSchema } from '@FE/types/roles';

  interface LaboratoryUserDetailsWithRoles extends LaboratoryUserDetails {
    assignedRole: LaboratoryRolesEnumSchema;
  }

  const props = withDefaults(
    defineProps<{
      user: LaboratoryUserDetailsWithRoles;
      disabled?: boolean;
      showRemoveFromLab?: boolean;
    }>(),
    {
      disabled: false,
      showRemoveFromLab: false,
    },
  );

  const { PreferredName, FirstName, LastName, UserId, UserEmail } = props.user;
  const displayName = useUser().displayName({
    preferredName: PreferredName,
    firstName: FirstName,
    lastName: LastName,
    email: UserEmail,
  });
  const emit = defineEmits(['remove-user-from-lab', 'assign-role']);
  const roles = Object.values(LaboratoryRolesEnumSchema.enum);

  const items: Array<Array<Object>> = roles
    // don't allow setting to Unknown, it's just for if the api sends us something strange
    .filter((role) => role !== 'Unknown')
    .map((role: LaboratoryRolesEnum) => {
      return [
        {
          label: role,
          click: () => {
            handleUpdateRole(role);
          },
        },
      ];
    });

  if (props.showRemoveFromLab) {
    items.push([
      {
        label: 'Remove From Lab',
        class: 'text-alert-danger-dark',
        click: () => {
          emit('remove-user-from-lab', { UserId, displayName });
        },
      },
    ]);
  }

  function handleUpdateRole(role) {
    const LabManager = role === LaboratoryRolesEnumSchema.enum.LabManager;
    const LabTechnician = role === LaboratoryRolesEnumSchema.enum.LabTechnician;
    const { ...cleanUser } = props.user;
    const labUser = { ...cleanUser, LabManager, LabTechnician };

    emit('assign-role', { labUser, displayName });
  }
</script>

<template>
  <div class="flex w-full justify-end">
    <UDropdown class="UDropdown" :items="items">
      <UButton :disabled="disabled" variant="ghost" color="gray" icon="i-heroicons-chevron-down" trailing>
        {{ props.user.assignedRole }}
      </UButton>
    </UDropdown>
  </div>
</template>

<style lang="scss">
  .UDropdown {
    .p-1 {
      padding: 8px 12px;
    }

    .active {
      border-radius: 100px;
      background-color: #c2c2c2;
    }
  }
</style>
