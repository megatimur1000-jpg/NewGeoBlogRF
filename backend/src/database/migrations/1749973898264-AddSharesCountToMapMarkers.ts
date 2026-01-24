import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSharesCountToMapMarkers1749973898264 implements MigrationInterface { // <-- Вот так должно быть
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("map_markers", new TableColumn({
            name: "shares_count",
            type: "integer",
            default: 0,
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("map_markers", "shares_count");
    }
}