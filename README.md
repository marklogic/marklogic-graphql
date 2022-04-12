# graphql-endpoint-poc

This is a rough proof-of-concept of an endpoint running in a MarkLogic appServer.
The endpoint accepts a graphql query string, parses the query into a graphql AST representation of the query, 
transforms the query into an Optic query, runs the query, and returns the result of the query.
- If everything works as expected, the returned value is a JSON object containing a "data" property which contains the data requested by the query.
- If errors occur, the returned value is a JSON object with the original query and error information.

This POC operates in a schema-less mode. Therefore, there is no introspection and validation is minimal.
Instead, views that are currently available in Optic can be used in requests to this service.

The parser used is the parser included in the JavaScript reference implementation of GraphQl (https://github.com/graphql/graphql-js). 

This POC can handle:
- Arguments
- Joins 
  - multiple on a single level, as well as nested.
  - Requires the use of custom directives (@childJoinColumn and @parentJoinColumn)
- Aliases
- GroupBy
  - Requires the use of a custom directive (@GroupBy)
- Aggregations
  - Requires the use of custom directives (@Count, @Sum, or @Average)

See sampleGraphqlQuery.sh for examples

## Quick Start
### Prerequisites
1. Java installed and JAVA_HOME set
2. Python installed to create the ML container from the script. Otherwise, use the docker command
### Steps
1. Create the Docker network that ML and Apollo will share
>`python Container/createNetwork.py`
2. Create the Docker container running MarkLogic using either of the following commands
>`python Container/createMarkLogicContainer.py`

>`docker run -it -d --name graphQlMarkLogic --network ml-graphql-net -p 8000:8000 -p 8001:8001 -p 8002:8002 -p 8003:8003 -p 8004:8004 -e MARKLOGIC_INIT=true -e MARKLOGIC_ADMIN_USERNAME=admin -e MARKLOGIC_ADMIN_PASSWORD=admin store/markl
ogicdb/marklogic-server:10.0-8.1-centos-1.0.0-ea2`

2. Wait for http://localhost:8001/ to permit login with admin/admin
3. Deploy the AppServer, REST extension, and code.
On Linux
>`./gradlew npmInstallGraphQl mlDeploy`

On Windows (unsure why I need to explicitly call npmInstallGraphQl on Windows)
> `gradlew.bat npmInstallGraphQl mlDeploy`
4. Go to http://localhost:8004/test/ and run the tests.
- Run the tests without suite clean up, by ensuring "Run Teardown after each suite" is NOT checked.
- This will make it so the following curl commands return data.
5. Test the endpoint using curl.
>`curl --digest --user admin:admin -X POST -H "Content-type: application/graphql" -d 'query someQuery { Humans(id: "1000") { name height } }' http://localhost:8004/LATEST/resources/graphql`
6You can also test the endpoint by running the bash script, sampleGraphqlQuery.sh
