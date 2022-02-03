# graphql-endpoint-poc

This is a rough proof-of-concept of an endpoint running on a MarkLogic appServer.
The endpoint accepts a graphql query string, then parses the query into a graphql AST representation of the query.
The returned value is a JSON object containing the original query and a string representation of the AST.

The parser used is the parser included in the JavaScript reference implementation of GraphQl (https://github.com/graphql/graphql-js). 

## Quick Start
1. Create the Docker container running MarkLogic
>`python Container/createMarkLogicContainer.py`
2. Wait for http://localhost:8001/ to permit login with admin/admin
3. Deploy the AppServer, REST extension, and code.
>`./gradlew mlDeploy`
4. Test the endpoint using curl.
>`curl --digest --user admin:admin -X POST -H "Content-type: application/txt" -d 'query someQuery { Humans(id: "1000") { name height } }' http://localhost:8003/LATEST/resources/graphql`
5. Go to http://localhost:8004/test/ and run the tests.

## Future Work
1. Transform the GraphQL AST into an Optic AST.
2. Use the Optic AST to run an Optic query in MarkLogic.
3. Transform the Optic query results into GraphQL results and return those results to the caller.