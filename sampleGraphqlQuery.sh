query="query someQuery { Humans { name height } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"

query="query withArgument { Humans (id: "1000") { name height } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"

query="query humansCarsJoin { Humans { id name height Cars { ownerId model year } id } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"

query="query humansCarsLaptopsHousesJoin  { Humans { id name height Cars { ownerId model year } id Laptops { ownerId model screenSize } id Houses { ownerId number street } id } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"

query="query humansArgumentCarsJoin { Humans (id: "1000") { id name height Cars { ownerId model year } id } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"

query="query humansCarsArgumentJoin { Humans { id name height Cars(id: "2") { ownerId model year } id } }"
printf "Query: $query\n"
echo $query > command.txt
result=$(curl --digest --user admin:admin -s -X POST -H "Content-type: application/graphql" -d@./command.txt http://localhost:8004/LATEST/resources/graphql)
printf "Result: $result\n\n\n"
