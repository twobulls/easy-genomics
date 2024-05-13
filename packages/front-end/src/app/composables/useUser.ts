type UserNameOptions = {
  title: string | undefined;
  preferredName: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
};

export default function useUser() {
  /**
   * Returns the display name of a user
   * @param nameOptions
   */
  function displayName(nameOptions: UserNameOptions) {
    const { title, preferredName, firstName, lastName } = nameOptions;

    const preferredOrFirstName = preferredName || firstName;
    const titleFormatted = title ? title + ' ' : '';
    return preferredOrFirstName ? `${titleFormatted}${preferredOrFirstName} ${lastName}` : '';
  }
  return {
    displayName,
  };
}
