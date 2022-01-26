import os
import subprocess

# docker network create --driver bridge alpine-net
os.chdir(os.path.dirname(os.path.realpath(__file__)))
subprocess.run(
        [
            'docker',
            'network',
            'create',
            '--driver',
            'bridge',
            'ml-graphql-net'
        ]
    )