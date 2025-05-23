# PostgreSQL Container Management Guide

This guide explains how PostgreSQL works in a Docker container and how to manage it effectively.

## Understanding PostgreSQL Processes

When you run PostgreSQL in a container, you'll see several processes running. Here's what each one does:

```bash
# Example output from: ps aux | grep postgres
postgres    # Main PostgreSQL server process
postgres: checkpointer        # Handles database checkpoints
postgres: background writer   # Writes dirty buffers to disk
postgres: walwriter          # Handles Write-Ahead Logging (WAL)
postgres: autovacuum launcher # Manages automatic vacuuming
postgres: logical replication launcher  # Handles replication
postgres: trav postgres 172.19.0.4(37904) idle  # Client connection
```

### Process Descriptions

1. **Main Server Process**

   - The parent process that manages all other PostgreSQL processes
   - Handles connection requests and spawns new processes

2. **Checkpointer**

   - Periodically writes all dirty buffers to disk
   - Creates checkpoints for crash recovery
   - Helps maintain database consistency

3. **Background Writer**

   - Writes dirty buffers to disk
   - Reduces I/O load during checkpoints
   - Runs continuously in the background

4. **WAL Writer**

   - Handles Write-Ahead Logging
   - Ensures data durability
   - Critical for crash recovery

5. **Autovacuum Launcher**

   - Manages automatic vacuuming of tables
   - Helps maintain database performance
   - Removes dead tuples and updates statistics

6. **Logical Replication Launcher**

   - Handles database replication
   - Manages streaming replication processes
   - Used for backup and high availability

7. **Client Connections**
   - Each client connection gets its own process
   - Format: `postgres: username database ip(port) status`
   - Example: `postgres: trav postgres 172.19.0.4(37904) idle`

## Container Management

### Checking Container Status

```bash
# List running PostgreSQL containers
docker ps | grep postgres

# Check container logs
docker logs postgres_db

# Inspect container configuration
docker inspect postgres_db
```

### Data Persistence

PostgreSQL data is stored in a Docker volume:

```bash
# View volume information
docker inspect postgres_db | grep -A 10 Mounts
```

The volume is typically mounted at:

- Container path: `/var/lib/postgresql/data`
- Host path: `/var/lib/docker/volumes/opt_postgres_data/_data`

### Common Maintenance Tasks

1. **Backup Database**

   ```bash
   docker exec -i postgres_db pg_dump -U trav -d postgres > backup.sql
   ```

2. **Restore Database**

   ```bash
   docker cp backup.sql postgres_db:/tmp/
   docker exec -i postgres_db psql -U trav -d postgres -f /tmp/backup.sql
   ```

3. **Clean Database**

   ```bash
   docker exec -i postgres_db psql -U trav -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```

4. **Check Database Size**
   ```bash
   docker exec -i postgres_db psql -U trav -d postgres -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
   ```

## Database Management

### Understanding psql Command-Line Flags

When using the `psql` command, several flags are commonly used:

```bash
# Basic format
docker exec -i postgres_db psql -U username -d database_name -c "SQL command"
```

Common flags:

- `-U username`: Specifies the PostgreSQL user (e.g., `-U trav`)
- `-d database_name`: Specifies which database to connect to (e.g., `-d postgres`)
- `-c "SQL command"`: Executes a SQL command (e.g., `-c "CREATE DATABASE new_db;"`)
- `-f filename`: Executes SQL commands from a file (e.g., `-f /tmp/backup.sql`)

Examples:

```bash
# Connect to postgres database and create a new database
docker exec -i postgres_db psql -U trav -d postgres -c "CREATE DATABASE new_db;"

# Connect to a specific database and list all tables
docker exec -i postgres_db psql -U trav -d po_server -c "\dt"

# Execute SQL commands from a file
docker exec -i postgres_db psql -U trav -d po_server -f /tmp/backup.sql
```

### Listing Databases

To see all databases in your PostgreSQL instance:

```bash
# List all databases
docker exec -i postgres_db psql -U trav -d postgres -c "\l"
```

Example output:

```
                                                 List of databases
   Name    | Owner | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules | Access privileges
-----------+-------+----------+-----------------+------------+------------+--------+-----------+-------------------
 postgres  | trav  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 template0 | trav  | libc     | en_US.utf8 | en_US.utf8 |        |           | =c/trav          +
           |       |          |                 |            |            |        |           | trav=CTc/trav
 template1 | trav  | libc     | en_US.utf8 | en_US.utf8 |        |           | =c/trav          +
           |       |          |                 |            |            |        |           | trav=CTc/trav
```

### Renaming a Database

To rename a database, follow these steps:

1. Create a new database with the desired name:

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "CREATE DATABASE new_database_name;"
```

2. Copy all data from the old database to the new one:

```bash
docker exec -i postgres_db pg_dump -U trav -d postgres | docker exec -i postgres_db psql -U trav -d new_database_name
```

3. Drop the old database (only after verifying the new one is correct):

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "DROP DATABASE postgres;"
```

Note: You cannot rename a database while it's in use, which is why we need to create a new one and copy the data.

### Database Maintenance

1. **Vacuum Database**

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "VACUUM FULL;"
```

2. **Analyze Database**

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "ANALYZE;"
```

3. **Check Database Size**

```bash
docker exec -i postgres_db psql -U trav -d postgres -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Check if container is running
   - Verify port mappings
   - Check PostgreSQL logs

2. **Permission Denied**

   - Verify user credentials
   - Check database user permissions
   - Ensure proper volume permissions

3. **Database Corrupted**
   - Check PostgreSQL logs
   - Verify volume integrity
   - Consider restoring from backup

### Useful Commands

```bash
# View PostgreSQL logs
docker logs postgres_db

# Connect to PostgreSQL CLI
docker exec -it postgres_db psql -U trav -d postgres

# Check PostgreSQL version
docker exec -i postgres_db psql -U trav -d postgres -c "SELECT version();"

# List all databases
docker exec -i postgres_db psql -U trav -d postgres -c "\l"

# List all tables
docker exec -i postgres_db psql -U trav -d postgres -c "\dt"
```
