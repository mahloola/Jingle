export function assertNotNil<T>(value: T | null, name = 'value'): asserts value is T {
  if (value === null) {
    throw new Error(`Expected ${name} to not be null`);
  }
  if (value === undefined) {
    throw new Error(`Expected ${name} to not be undefined`);
  }
}
