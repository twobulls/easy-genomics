import { addCollection } from '@iconify/vue';
import heroicons from '@iconify-json/heroicons/icons.json';

export default defineNuxtPlugin(() => {
  addCollection(heroicons);
});
