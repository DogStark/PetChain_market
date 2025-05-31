### 1. Environment Configuration
```bash
# Copy environment template
cp .env.backup.example .env.backup

# Edit configuration
nano .env.backup
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Run migrations for backup metadata tables
npm run migration:run
```

### 4. Start Backup Services
```bash
# Start the backup scheduler
npm run start:backup

# Or start with Docker
docker-compose -f docker-compose.backup.yml up -d
```

## Usage

### Manual Backup Operations
```bash
# Create full backup
curl -X POST http://localhost:3000/backup/full

# Create incremental backup
curl -X POST http://localhost:3000/backup/incremental \
  -H "Content-Type: application/json" \
  -d '{"lastBackupTime": "2024-01-01T00:00:00Z"}'

# Verify backup integrity
curl -X POST http://localhost:3000/backup/verify/backup_id_here

# Test recovery
curl -X POST http://localhost:3000/backup/test-recovery/backup_id_here
```

### Recovery Operations
```bash
# Perform recovery
curl -X POST http://localhost:3000/backup/recover \
  -H "Content-Type: application/json" \
  -d '{
    "backupId": "backup_id_here",
    "verifyBeforeRestore": true,
    "createBackupBeforeRestore": true
  }'
```

### Monitoring
```bash
# Check backup health
curl http://localhost:3000/backup/health

# List all backups
curl http://localhost:3000/backup/list
```

## Scheduled Operations
- **Full Backup**: Daily at 2:00 AM
- **Incremental Backup**: Every 6 hours
- **Integrity Verification**: Weekly
- **Cleanup**: Removes backups older than retention period

## Configuration Options

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petchain
DB_USER=postgres
DB_PASSWORD=your_password

# Backup Configuration
BACKUP_PATH=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION_LEVEL=6

# Notification Settings
EMAIL_ALERTS_ENABLED=true
SLACK_ALERTS_ENABLED=true
SMS_ALERTS_ENABLED=false

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=petchain-backups
```

## Disaster Recovery Procedures

### 1. Assessment
- Identify the scope of data loss
- Determine the recovery point objective (RPO)
- Select appropriate backup for recovery

### 2. Recovery Execution
```bash
# Test recovery first
./scripts/test-recovery.sh /path/to/backup.sql.gz

# Perform actual recovery
./scripts/restore.sh /path/to/backup.sql.gz target_database
```

### 3. Verification
- Verify data integrity
- Test application functionality
- Validate business operations

### 4. Documentation
- Record recovery actions taken
- Update recovery procedures if needed
- Conduct post-recovery review

## Monitoring and Alerts

### Health Metrics
- Backup success/failure rates
- Backup duration and size trends
- Storage utilization
- Recovery test results

### Alert Conditions
- Backup failures
- Integrity check failures
- Storage space warnings
- Extended backup durations

### Notification Channels
- Email notifications for all alerts
- Slack integration for team notifications
- SMS alerts for critical failures

## Best Practices

### Backup Strategy
1. **3-2-1 Rule**: 3 copies of data, 2 different media types, 1 offsite
2. **Regular Testing**: Monthly recovery tests
3. **Documentation**: Keep recovery procedures updated
4. **Monitoring**: 24/7 backup health monitoring

### Security
- Encrypt backups at rest and in transit
- Secure backup storage locations
- Regular access audits
- Rotate encryption keys periodically

### Performance
- Schedule backups during low-traffic periods
- Use compression to reduce storage requirements
- Implement incremental backups for efficiency
- Monitor backup performance metrics

## Troubleshooting

### Common Issues
1. **Backup Failures**: Check disk space and database connectivity
2. **Slow Backups**: Consider incremental backups or compression tuning
3. **Recovery Failures**: Verify backup integrity and database permissions
4. **Storage Issues**: Implement automated cleanup and monitoring

### Log Locations
- Application logs: `./logs/backup.log`
- System logs: `/var/log/petchain-backup/`
- Docker logs: `docker-compose logs backup-service`

## Support
For issues and questions, please refer to the troubleshooting guide or contact the system administrator.