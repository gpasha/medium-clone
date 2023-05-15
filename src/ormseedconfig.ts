import ormconfig from "@app/ormconfig";
import { ConnectionOptions } from "typeorm";

const ormseedconfig: ConnectionOptions = {
    ...ormconfig,
    migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/seeds'
    }
}

export default ormseedconfig