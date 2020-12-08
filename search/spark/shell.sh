docker exec -it spark_spark-master.1.$(docker service ps -f 'name=spark_spark-master.1' spark_spark-master -q --no-trunc | head -n1) /bin/bash -c "/shared/startShell.sh"
