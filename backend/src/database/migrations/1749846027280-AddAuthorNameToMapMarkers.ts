import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"; // Убедитесь, что TableColumn импортирован

export class AddAuthorNameToMapMarkers1749846027280 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("map_markers", new TableColumn({
            name: "author_name",
            type: "varchar",
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("map_markers", "author_name");
    }

}