import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriorityToTask1751000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM ('low', 'medium', 'high')
    `);

    await queryRunner.query(`
      ALTER TABLE "task"
      ADD COLUMN "priority" "task_priority_enum" NOT NULL DEFAULT 'medium'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "task_priority_enum"`);
  }
}
