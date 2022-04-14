import os
import subprocess

os.chdir(os.path.dirname(os.path.realpath(__file__)))
# subprocess.run(
#         [
#             'docker',
#             'login',
#             '--username', '****',
#             '--password', '****'
#         ]
#     )
subprocess.run(
        [
            'docker',
            'run',
            '-it',
            '-d',
            '--name', 'graphQlMarkLogic',
            '--network', 'ml-graphql-net',
            '-p', '8000:8000',
            '-p', '8001:8001',
            '-p', '8002:8002',
            '-p', '8003:8003',
            '-p', '8004:8004',
            '-v', 'C:/Users/PhilB/Documents/personal/workspaces/markLogic/assignments/graphQL/marklogic-graphql/Container/Logs:/var/opt/MarkLogic/Logs',
            '-e', 'MARKLOGIC_INIT=true',
            '-e', 'MARKLOGIC_ADMIN_USERNAME=admin',
            '-e', 'MARKLOGIC_ADMIN_PASSWORD=admin',
            'store/marklogicdb/marklogic-server:10.0-8.1-centos-1.0.0-ea2'
        ]
    )
