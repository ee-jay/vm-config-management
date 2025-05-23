# PostgreSQL Database Import Guide

This guide outlines the steps to import a SQL file into a PostgreSQL database running in Docker and view it through PGAdmin.

## Prerequisites

- Docker installed and running
- PostgreSQL container running (named `postgres_db`)
- PGAdmin container running (named `pgadmin`)
- SQL file to import (in this case, located at `/opt/test.sql`)

## Understanding Data Persistence

The PostgreSQL container uses Docker volumes to ensure data persistence:

1. The container has a volume mounted at `/var/lib/postgresql/data`
2. This volume (typically named `opt_postgres_data`) is stored on the host system
3. When you import data:
   - The SQL file is temporarily copied to `/tmp` in the container
   - The `psql` command executes the SQL statements
   - The resulting database tables and data are written to the mounted volume
   - This data persists even if the container is stopped or removed

You can verify the volume configuration with:

```bash
docker inspect postgres_db | grep -A 10 Mounts
```

This ensures that your imported data remains available after container restarts or updates.

## Importing Binary Format Dumps with pg_restore

When you have a binary format PostgreSQL dump (created with `pg_dump -Fc`), you need to use `pg_restore` instead of `psql` to import it:

```bash
# Copy the binary dump file into the container
docker cp /path/to/your/dump.sql container_name:/tmp/dump.sql

# Import using pg_restore with appropriate flags
docker exec -i container_name pg_restore -U username -d database_name --clean --no-owner /tmp/dump.sql
```

### Important pg_restore Flags

- `--clean`: Drops existing objects before creating new ones
- `--no-owner`: Skips commands to set ownership of objects to match the original database
- `-U username`: Specifies the PostgreSQL user
- `-d database_name`: Specifies the target database

### Common Issues and Solutions

1. **Schema Already Exists**

   - Use the `--clean` flag to drop existing objects
   - Or manually drop the schema: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`

2. **Role/Owner Does Not Exist**

   - Use the `--no-owner` flag to skip ownership commands
   - Or create the missing role: `CREATE ROLE role_name;`

3. **Duplicate Key Violations**
   - Use the `--clean` flag to ensure a clean import
   - Or manually clean the database before importing

## Step 1: Copy SQL File into PostgreSQL Container

First, we need to copy the SQL file into the PostgreSQL container since the container can't directly access files on the host system:

```bash
docker cp /opt/test.sql postgres_db:/tmp/test.sql
```

## Step 2: Import SQL File into PostgreSQL

Import the SQL file using the `psql` command inside the PostgreSQL container:

```bash
docker exec -i postgres_db psql -U trav -d postgres -f /tmp/test.sql
```

Notes:

- `-U trav`: Specifies the username (in this case, 'trav')
- `-d postgres`: Specifies the database name
- `-f /tmp/test.sql`: Specifies the path to the SQL file inside the container

## Step 3: Verify Import Success

Check that the tables were created successfully:

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "\dt"
```

This will list all tables in the database. In our case, it showed 32 tables were created.

## Step 4: Access Database through PGAdmin

1. Open PGAdmin in your web browser
2. Log in with your credentials:

   - Email: sheets.eejay@gmail.com
   - Password: 1981

3. Add a new server connection with these details:
   - Host: postgres_db
   - Port: 5432
   - Database: postgres
   - Username: trav
   - Password: 1981

### Updating an Existing PGAdmin Connection

To update a database connection in PGAdmin:

1. In the Object Explorer (left sidebar):

   - Look under "Servers"
   - Find your server name (e.g., "wikitest")
   - Right-click on the server name

2. Select "Properties" from the context menu

3. In the Properties dialog:

   - Click on the "Connection" tab
   - Update the "Database" field to "po_server"
   - Leave other fields unchanged:
     - Host: postgres_db
     - Port: 5432
     - Username: trav
     - Password: 1981

4. Click "Save" to apply the changes

After saving, you should see two databases listed under your server:

- po_server
- postgres

## Troubleshooting Notes

- If you see role-related errors during import (like "role does not exist"), these are usually permission-related and may not affect the actual data import
- Make sure the PostgreSQL container is running before attempting the import
- Ensure you have the correct permissions to access the SQL file on the host system
- Verify that the database user has sufficient privileges to create tables and import data

## Common Commands Reference

```bash
# List PostgreSQL containers
docker ps | grep postgres

# Copy file into container
docker cp /path/to/file.sql container_name:/tmp/file.sql

# Import SQL file
docker exec -i container_name psql -U username -d database_name -f /tmp/file.sql
# Note: The -i flag keeps STDIN open, which is important for commands
# that might need to handle input streams, like psql

# List tables in database
docker exec -i container_name psql -U username -d database_name -c "\dt"

# Count records in a table
docker exec -i container_name psql -U username -d database_name -c "SELECT COUNT(*) FROM table_name;"
```
