module.exports = {
  apps: [
    {
      name: 'baitech-backend',
      script: 'uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000',
      cwd: '/var/www/baitech',
      interpreter: '/var/www/baitech/venv/bin/python',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        ENVIRONMENT: 'production'
      },
      error_file: '/var/www/baitech/logs/backend-error.log',
      out_file: '/var/www/baitech/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 4000
    },
    {
      name: 'baitech-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/baitech/baitech-frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/baitech/logs/frontend-error.log',
      out_file: '/var/www/baitech/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000
    }
  ]
};
