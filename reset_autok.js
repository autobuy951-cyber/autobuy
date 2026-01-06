const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./adatbazis.sqlite');

db.serialize(() => {
    // 1. Mentjük a meglévő autókat
    db.all("SELECT * FROM autok", (err, rows) => {
        if (err) {
            console.error("Hiba a kiolvasáskor:", err);
            return;
        }
        console.log("Mentett autók:", JSON.stringify(rows));

        // 2. Ha sikerült a mentés, töröljük a problémás táblákat
        db.run("DROP TABLE IF EXISTS autok_backup");
        db.run("DROP TABLE IF EXISTS autok", (err) => {
            if (err) {
                console.error("Hiba a törléskor:", err);
            } else {
                console.log("Táblák törölve. A szerver újraindításakor újak jönnek létre.");

                // (Opcionális: Ha fontos az adat, itt vissza lehetne írni, de 
                // mivel a Sequelize fogja létrehozni a táblát, jobb, ha azt a szerver indulása után tesszük meg
                // vagy manuálisan SQL-el, ha a szerver létrehozta.)
                // Most csak kiírtuk a konzolra a mentést.
            }
        });
    });
});
