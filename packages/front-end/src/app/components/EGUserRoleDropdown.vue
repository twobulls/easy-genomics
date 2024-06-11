<script setup lang="ts">
import { LaboratoryUserDetails } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user-details';
import { LaboratoryRolesEnumSchema, LaboratoryRolesEnum } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/roles';
import { LabUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/lab-user';

const props = withDefaults(
  defineProps<{
    user: LabUser;
    disabled?: boolean;
    showRemoveFromLab?: boolean;
  }>(),
  {
    disabled: false,
    showRemoveFromLab: false,
  }
);

const emit = defineEmits(['remove-user-from-lab', 'assign-lab-role']);

const { assignedRole, displayName, UserId } = props.user;
const roles = Object.values(LaboratoryRolesEnumSchema.enum).map((role) => role);

const items: Array<Array<Object>> = roles.map((role: LaboratoryRolesEnum) => {
  return [
    {
      label: role,
      // click: () => console.log(`emit 'assign-lab-role'`),
      click: () => emit('assign-lab-role', { user: props.user, role }),
    },
  ];
});

if (props.showRemoveFromLab) {
  items.push([
    {
      label: 'Remove From Lab',
      class: 'text-alert-danger-dark',
      // click: () => console.log('emitl remove-user-from-lab; user: ', props.user),
      click: () => {
        console.log('emit remove-user-from-lab; user: ', props.user),
          emit('remove-user-from-lab', { user: props.user })
      },
    },
  ]);
}
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
