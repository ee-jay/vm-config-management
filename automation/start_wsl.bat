@echo off
REM Start WSL and ensure cron service is running
REM This script should be run at Windows startup

echo Starting WSL and cron service...

REM Start WSL (this will start the default distribution)
wsl -d fedora -e bash -c "echo 'WSL started successfully'"

REM Ensure cron service is running
wsl -d fedora -e bash -c "sudo systemctl start crond"

REM Verify cron status
wsl -d fedora -e bash -c "sudo systemctl is-active crond"

echo WSL and cron service startup complete.

REM Keep WSL running in background by starting a long-running process
wsl -d fedora -e bash -c "while true; do sleep 3600; done" &

exit /b 0 