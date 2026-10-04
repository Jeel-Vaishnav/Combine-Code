# Database Safety Guide for Algothon Project

## Current Development Setup

The project currently uses SQLite for development with the following configuration:
- **Database File**: `./prisma/dev.db`
- **Provider**: SQLite
- **Connection String**: `file:./dev.db` (defined in `.env` and `prisma/schema.prisma`)

### Safety Features of Current Setup:
1. **Persistence**: Data persists between application restarts
2. **Backups**: Manual backup possible by copying the `.db` file
3. **Portability**: Single file database that can be easily moved
4. **Simplicity**: No external dependencies for development

## Making Development Data Safer

### 1. Regular Backups
```bash
# Manual backup
cp prisma/dev.db prisma/dev.db.backup_$(date +%Y%m%d_%H%M%S)

# Automated backup script (create backup.sh)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp prisma/dev.db "prisma/backups/dev.db.backup_$TIMESTAMP"
# Keep only last 10 backups
ls -t prisma/backups/dev.db.backup_* | tail -n +11 | xargs -r rm
```

### 2. Version Control Exceptions
The `.gitignore` already excludes:
```
prisma/dev.db
```
This prevents accidental commits of sensitive data while allowing the database file to exist locally.

### 3. Data Export/Import
Use Prisma's built-in commands:
```bash
# Export data to JSON
npx prisma db export

# Import data from JSON
npx prisma db import
```

## Production Database Recommendations

For production deployment, SQLite is not recommended due to concurrency limitations. Instead, use:

### Option 1: PostgreSQL (Recommended)
1. **Update `.env`**:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="your-strong-production-secret"
   ```

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Deploy to**: Vercel (with Postgres), Neon, Supabase, AWS RDS, Google Cloud SQL, etc.

### Option 2: MySQL
1. **Update `.env`**:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="your-strong-production-secret"
   ```

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

## Data Safety Best Practices

### 1. Environment Variables
- Never commit `.env` to version control
- Use `.env.example` as template for team members
- Set `JWT_SECRET` to a strong, unique value in production
- Use different secrets for development vs production

### 2. Migration Safety
```bash
# Always preview migrations before applying
npx prisma migrate dev --name "migration-name" --create-only

# Apply migrations safely
npx prisma migrate deploy

# Reset development database (WARNING: loses data!)
# npx prisma migrate reset --force
```

### 3. Backup Strategies for Production
- **Managed Services**: Use built-in backup features of your database provider
- **Self-Hosted**: Implement regular `pg_dump` / `mysqldump` cron jobs
- **Point-in-Time Recovery**: Enable WAL archiving for PostgreSQL
- **Geographic Replication**: For high availability requirements

### 4. Monitoring
- Set up database connection monitoring
- Track query performance and slow queries
- Monitor disk space and connection limits
- Set up alerts for failed backups or replication lag

## Disaster Recovery Procedures

### If Development Database is Corrupted/Lost:
1. Check for recent backups in `prisma/backups/` directory
2. If available, restore: `cp prisma/backups/dev.db.backup_XXXX prisma/dev.db`
3. If no backup, reseed: `npm run db:seed`
4. Reapply any local migrations: `npx prisma migrate dev`

### If Production Database Issues:
1. Immediately switch to read-only mode if possible
2. Contact your database provider's support
3. Restore from most recent backup
4. Verify data integrity after restoration
5. Update connection strings if failover to replica needed

## Local Development Tips

1. **Seed Data Management**:
   - The seed script creates realistic test data
   - Run `npm run db:seed` to refresh development data
   - Modify `prisma/seed.ts` to customize seed data for your team

2. **Database Studio**:
   - View and edit data visually: `npx prisma studio`
   - Runs on http://localhost:5555 by default

3. **Migration History**:
   - View all migrations: `ls prisma/migrations/`
   - Each migration contains SQL and metadata

## Security Considerations

1. **Database Credentials**:
   - Never hardcode credentials in code
   - Always use environment variables
   - Use different credentials for different environments

2. **Network Security**:
   - For production databases, restrict IP access
   - Use SSL/TLS connections when connecting remotely
   - Consider using private networks/VPCs

3. **Access Control**:
   - Use least-privilege database users
   - Separate users for application vs migrations vs admin tasks
   - Regularly audit database permissions

## Vercel Deployment Specifics

If deploying to Vercel:
1. Vercel provides built-in PostgreSQL integration
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (provided by Vercel Postgres)
   - `JWT_SECRET` (generate a strong secret)
3. Vercel handles backups and scaling automatically
4. Use `vercel env pull` to sync environment variables locally

## Conclusion

For development, the current SQLite setup is reasonable when combined with regular backups. For production, migrate to PostgreSQL or MySQL using the provided examples. Always:
- Keep backups
- Use environment variables for secrets
- Test migration scripts
- Monitor database health
- Have a documented recovery procedure

The authentication system you've implemented stores passwords securely (bcrypt hashed) and uses JWT tokens, so the primary safety concern is protecting the project/task/user data itself, which is addressed by the database strategies above.