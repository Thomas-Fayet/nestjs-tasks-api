import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1751000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"            SERIAL PRIMARY KEY,
        "first_name"    VARCHAR NOT NULL,
        "last_name"     VARCHAR NOT NULL,
        "email"         VARCHAR NOT NULL UNIQUE,
        "password"      VARCHAR NOT NULL,
        "refresh_token" TEXT,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task" (
        "id"          SERIAL PRIMARY KEY,
        "title"       VARCHAR NOT NULL,
        "description" VARCHAR NOT NULL,
        "status"      VARCHAR NOT NULL,
        "user_id"     INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "task"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
