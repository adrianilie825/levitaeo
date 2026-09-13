export class MembershipValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipValidationError";
  }
}

export class MembershipPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipPersistenceError";
  }
}
