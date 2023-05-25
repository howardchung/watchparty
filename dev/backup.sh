#!/bin/bash

sudo docker exec -it --user postgres postgres sh -c "pg_dump postgres" > postgres.bak

sudo docker exec -it redis sh -c "cat dump.rdb" > dump.rdb

# on local: scp root@ip:dump.rdb dump.rdb

sudo docker exec -it --user postgres postgres sh -c "psql postgres" < postgres.bak

sudo docker exec -it redis sh -c "cat > dump.rdb" < dump.rdb