export class ModuleError extends Error {
  constructor(
    message: string,
    public moduleId: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ModuleError';
  }
}

export class ModuleInitializationError extends ModuleError {
  constructor(moduleId: string, error: Error) {
    super(`Failed to initialize module: ${moduleId}`, moduleId, error);
    this.name = 'ModuleInitializationError';
  }
}

export class ModuleLoadError extends ModuleError {
  constructor(moduleId: string, error: Error) {
    super(`Failed to load module: ${moduleId}`, moduleId, error);
    this.name = 'ModuleLoadError';
  }
}