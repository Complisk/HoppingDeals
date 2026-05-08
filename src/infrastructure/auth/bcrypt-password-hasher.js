import bcrypt from "bcryptjs";

/** @implements {import("../../application/ports/password-hasher.js").PasswordHasher} */
export class BcryptPasswordHasher {
  constructor({ saltRounds = 10 } = {}) {
    this.saltRounds = saltRounds;
  }

  async hash(plaintext) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(plaintext, salt);
  }

  compare(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  }
}
