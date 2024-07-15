"use strict";
const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

const config = {
    connectionString:
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs
            .readFileSync("C:\\Users\\podop\\.postgresql\\root.crt")
            .toString(),
    },
};

const conn = new pg.Client(config);

conn.connect((err) => {
    if (err) throw err;
});

async function createTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS characters (
            id INT PRIMARY KEY,
            name VARCHAR(255),
            data JSONB
        );
    `;
    await conn.query(createTableQuery);
    console.log("Таблица 'characters' создана.");
}

async function fetchCharacters() {
    try {
        const response = await axios.get("https://rickandmortyapi.com/api/character");
        const characters = response.data.results;

        for (const character of characters) {
            const { id, name, ...rest } = character;
            const data = rest;
            const query = `
                INSERT INTO characters (id, name, data)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING;
            `;
            await conn.query(query, [id, name, data]);
        }

        console.log("Персонажи созданы.");
    } catch (error) {
        console.error("Ошибка создания персонажей: ", error);
    }
}

async function selectCharacters() {
    try {
        const query = `
            SELECT id, name, data
            FROM characters;
        `;
        const result = await conn.query(query);
        console.log("Добавленные персонажи:");
        console.log(result.rows);
    } catch (error) {
        console.error("Ошибка получения из таблицы добавленных персонажей: ", error);
    } finally {
        conn.end();
    }
}

async function main() {
    await createTable();
    await fetchCharacters();
    await selectCharacters();
}

main();