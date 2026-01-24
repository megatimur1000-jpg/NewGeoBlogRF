const { DataSource } = require("typeorm");

// Определяем сущность прямо здесь
const MapMarker = require("./dist/entities/MapMarker.js").MapMarker;

// Определяем миграции прямо здесь
const AddAuthorNameToMapMarkers = require("./dist/database/migrations/1749846027280-AddAuthorNameToMapMarkers.js").AddAuthorNameToMapMarkers1749846027280;
const AddSharesCountToMapMarkers = require("./dist/database/migrations/1749973898264-AddSharesCountToMapMarkers.js").AddSharesCountToMapMarkers1749973898264;

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "bestuser_temp",
    password: "55555",
    database: "bestsite",
    synchronize: false,
    logging: true,
    entities: [MapMarker],
    migrations: [
        AddAuthorNameToMapMarkers,
        AddSharesCountToMapMarkers
    ],
    subscribers: [],
});

module.exports = AppDataSource;
