<script setup lang="ts">
  import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user-details';
  import { LaboratoryRolesEnum, LaboratoryRolesEnumSchema } from '~/types/roles';

  interface LaboratoryUserDetailsWithRoles extends LaboratoryUserDetails {
    assignedRole: LaboratoryRolesEnumSchema;
  }

  const props = defineProps<{
    user: LaboratoryUserDetailsWithRoles;
    disabled: boolean;
    showRemoveFromLab: boolean;
  }>();

  const { PreferredName, FirstName, LastName, UserId, UserEmail } = props.user;
  const displayName = useUser().displayName({
    preferredName: PreferredName,
    firstName: FirstName,
    lastName: LastName,
    email: UserEmail,
  });
  const emit = defineEmits(['remove-user-from-lab', 'assign-role']);
  const assignedRole = ref<LaboratoryRolesEnum>(LaboratoryRolesEnumSchema.enum.LabTechnician);
  const roles = Object.values(LaboratoryRolesEnumSchema.enum).map((role) => role);

  if (props.user.assignedRole === LaboratoryRolesEnumSchema.enum.LabManager) {
    assignedRole.value = LaboratoryRolesEnumSchema.enum.LabManager;
  } else {
    assignedRole.value = LaboratoryRolesEnumSchema.enum.LabTechnician;
  }

  const items: Array<Array<Object>> = roles.map((role: LaboratoryRolesEnum) => {
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
    const { assignedRole, ...cleanUser } = props.user;
    const labUser = { ...cleanUser, LabManager, LabTechnician };

    emit('assign-role', { labUser, displayName });
  }

  watch(
    () => props.user,
    (newUser) => {
      if (newUser.assignedRole === LaboratoryRolesEnumSchema.enum.LabManager) {
        assignedRole.value = LaboratoryRolesEnumSchema.enum.LabManager;
      } else {
        assignedRole.value = LaboratoryRolesEnumSchema.enum.LabTechnician;
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="flex w-full justify-end">
    <UDropdown class="UDropdown" :items="items">
      <UButton :disabled="disabled" variant="ghost" color="gray" icon="i-heroicons-chevron-down" trailing>
        {{ assignedRole }}
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
