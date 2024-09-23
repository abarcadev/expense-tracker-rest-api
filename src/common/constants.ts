const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Invalid credentials',
  REGISTER_NOT_SAVED: 'Register could not be saved',
  REGISTER_NOT_FOUND: (schemaName: string, id: string) =>
    `Register with ${schemaName}Id ${id} not found`,
  REGISTER_DELETED: 'Register has been deleted',
};

export { ERROR_MESSAGES };
