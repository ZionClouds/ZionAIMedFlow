#!/usr/bin/env bash
cat >/etc/motd <<EOL
  _____
  /  _  \ __________ _________   ____
 /  /_\  \\___   /  |  \_  __ \_/ __ \
/    |    \/    /|  |  /|  | \/\  ___/
\____|__  /_____ \____/ |__|    \___  >
        \/      \/                  \/
A P P   S E R V I C E   O N   L I N U X

Documentation: http://aka.ms/webapp-linux
NodeJS quickstart: https://aka.ms/node-qs

EOL
cat /etc/motd

service ssh start
#service nscd start

# Get environment variables to show up in SSH session
eval $(printenv | awk -F= '{print "export " $1"="$2 }' >> /etc/profile)

if [[ -z "${Port}" ]]; then
  port_number=80
else
  port_number="${Port}"
fi

if [[ -z "${Workers}" ]]; then
  workers_number=3
else
  workers_number="${Workers}"
fi

uvicorn app:app --host 0.0.0.0 --port $port_number --reload --workers $workers_number