@Library('shared-libraries') _

import groovy.json.JsonSlurperClassic
githubAPIUrl="https://api.github.com/repos/marklogic/marklogic-graphql"
JIRA_ID=""
void PreBuildCheck() {
     def obj=new abortPrevBuilds();
     obj.abortPrevBuilds();

     if(env.CHANGE_ID){
        if(PRDraftCheck()){
            sh 'exit 1'
        }
        if((!env.CHANGE_TITLE.startsWith("GRAPHQL-")) && (!env.CHANGE_TITLE.startsWith("DEVO-"))){
            sh 'exit 1'
        }
         JIRA_ID=env.CHANGE_TITLE.split(':')[0]
         env.JIRA_ID=JIRA_ID
        if(getReviewState().equalsIgnoreCase("CHANGES_REQUESTED")){
            println(reviewState)
            sh 'exit 1'
        }
     }
}
def PRDraftCheck(){
    withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
        PrObj= sh (returnStdout: true, script:'''
                   curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID
                ''')
    }
    def jsonObj = new JsonSlurperClassic().parseText(PrObj.toString().trim())
    return jsonObj.draft
}
def getReviewState(){
    script{
        def  reviewResponse;
        def commitHash;
        withCredentials([usernameColonPassword(credentialsId: '550650ab-ee92-4d31-a3f4-91a11d5388a3', variable: 'Credentials')]) {
           reviewResponse = sh (returnStdout: true, script:'''
                                    curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID/reviews
                            ''')
           commitHash = sh (returnStdout: true, script:'''
                                 curl -u $Credentials  -X GET  '''+githubAPIUrl+'''/pulls/$CHANGE_ID
                         ''')
        }
        def jsonObj = new JsonSlurperClassic().parseText(commitHash.toString().trim())
        def commit_id=jsonObj.head.sha
        println(commit_id)
        def reviewState=getReviewStateOfPR reviewResponse,1,commit_id ;
        return reviewState
    }
}
def isPRMergable(){
    return !params.regressions && env.TESTS_PASSED?.toBoolean()
}
pipeline{
    agent {label 'devExp'};
    options {
      	checkoutToSubdirectory 'graphql'
      	buildDiscarder logRotator(artifactDaysToKeepStr: '7', artifactNumToKeepStr: '', daysToKeepStr: '30', numToKeepStr: '')
    }
    parameters{
    	booleanParam(name: 'regressions', defaultValue: false, description: 'indicator if build is for regressions')
    }
    environment{
    	JAVA_HOME_DIR="/home/builder/java/openjdk-1.8.0-262"
    	GRADLE_DIR   =".gradle"
    	DMC_USER     = credentials('MLBUILD_USER')
        DMC_PASSWORD = credentials('MLBUILD_PASSWORD')
    }
    stages{
        stage('pre-build'){
            steps{
                PreBuildCheck()
            }
        }
        stage('lint'){
            steps{
                sh label:"lint", script: '''#!/bin/bash
                    export JAVA_HOME=$JAVA_HOME_DIR
                    export GRADLE_USER_HOME=$WORKSPACE/$GRADLE_DIR
                    export PATH=$GRADLE_USER_HOME:$JAVA_HOME/bin:$PATH;
                    cd ${WORKSPACE}/graphql;
                    ./gradlew lint  -PnodeDistributionBaseUrl=http://node-mirror.eng.marklogic.com:8080/ --info ;
                '''
            }
        }
        stage('tests'){
            steps{
                sh label:"test", script: '''#!/bin/bash
                    portnumber="$(((EXECUTOR_NUMBER+1)*1000))";
                    port1="$((8001-portnumber))";
                    port0="$((8000-portnumber))";
                    port2="$((8002-portnumber))";
                    port3="$((8003-portnumber))";
                    port4="$((8004-portnumber))";
                    docker run -it -d --name=${BUILD_TAG} -v ${WORKSPACE}/graphql:/space/graphql  -v ${JAVA_HOME_DIR}:/space/java  -p ${port1}:8001 -p ${port0}:8000 -p ${port2}:8002  -p ${port3}:8003 -p ${port4}:8004 -e MARKLOGIC_INIT=true -e MARKLOGIC_ADMIN_USERNAME=admin -e MARKLOGIC_ADMIN_PASSWORD=admin ml-docker-dev.marklogic.com/marklogic/marklogic-server-centos:10.0-9.1-centos-1.0.0-ea4
                    sleep 30s

                    docker exec -i ${BUILD_TAG} /bin/bash -c "
                        export JAVA_HOME=/space/java ; \
                        export GRADLE_USER_HOME=/space/.gradle; \
                        export PATH=$GRADLE_USER_HOME:$JAVA_HOME/bin:$PATH; \
                        sudo chmod 777 /space; \
                        sudo chmod -R 777 /space/graphql; \
                        cd /space/graphql; \
                        ./gradlew mlDeploy; \
                        ./gradlew mlUnitTest --info; \
                        ./sampleGraphqlQuery.sh; \
                        sudo rm -rf $GRADLE_USER_HOME
                    "
                '''
               junit '**/*.xml'
            }
            post{
                always{
                   cleanWs()
                   sh '''#!/bin/bash
                        docker rm -f ${BUILD_TAG}
                   '''
                }
                success{
                    script{
                        env.TESTS_PASSED="true"
                    }
                }
                failure{
                    script{
                        env.TESTS_PASSED="false"
                    }
                }
            }
        }
        stage('code-review'){
            when{
                expression {return isPRMergable()}
                allOf {changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'develop', title: '', url: ''}
                beforeAgent true
            }
            steps{
                script{
                    def reviewState=getReviewState()
                    if (reviewState.equalsIgnoreCase("APPROVED")){
                         sh 'exit 0'
                    }else{
                         sh 'exit 1'
                    }
                }
            }
        }
        stage('merge'){
            when{
                allOf {changeRequest author: '', authorDisplayName: '', authorEmail: '', branch: '', fork: '', id: '', target: 'develop', title: '', url: ''}
                beforeAgent true
            }
            steps{
                sh "curl -o - -s -w \"\n%{http_code}\n\" -X PUT -d '{\"commit_title\": \"$JIRA_ID: merging PR\", \"merge_method\": \"rebase\"}' -u $Credentials  "+githubAPIUrl+"/pulls/$CHANGE_ID/merge | tail -2 > mergeResult.txt"
                script{
                    def mergeResult = readFile('mergeResult.txt').trim()
                    if(mergeResult=="200"){
                        println("Merge successful")
                    }else{
                        println("Merge Failed")
                        sh 'exit 1'
                    }
                }
            }
        }
        stage('regressions'){
            when {
                expression {
                    return params.regressions
                }
            }
            stages{
                stage('docker-cluster'){
                    steps{
                        copyRPM 'Release','10.0-9.1'
                        script{
                            def dockerhost=setupMLDockerCluster 3
                            sh '''
                                docker exec -u builder -i '''+dockerhost+''' /bin/bash -c "
                                 export JAVA_HOME=$JAVA_HOME_DIR
                                 export GRADLE_USER_HOME=$WORKSPACE/$GRADLE_DIR
                                 export PATH=$GRADLE_USER_HOME:$JAVA_HOME/bin:$PATH
                                 cd ${WORKSPACE}/graphql;
                                 ./gradlew mlDeploy --info
                                 ./gradlew mlUnitTest --info
                                "
                            '''
                        }
                        junit '**/*.xml'
                    }
                    post{
                       always{
                          cleanWs()
                          sh '''#!/bin/bash
                            docker rm -f $(docker ps -a -q)
                          '''
                       }
                    }
                }
                stage('VM-singlenode'){
                    steps{
                        copyRPM 'Release','10.0.9.1'
                        setUpML '$WORKSPACE/xdmp/src/Mark*.rpm'
                        sh '''
                            export JAVA_HOME=$JAVA_HOME_DIR
                            export GRADLE_USER_HOME=$WORKSPACE/$GRADLE_DIR
                            export PATH=$GRADLE_USER_HOME:$JAVA_HOME/bin:$PATH
                            cd ${WORKSPACE}/graphql;
                            ./gradlew mlDeploy --info
                            ./gradlew mlUnitTest --info
                        '''
                        junit '**/*.xml'
                    }
                    post{
                        always{
                            cleanWs()
                            sh '/usr/local/sbin/mladmin stop; /usr/local/sbin/mladmin remove'
                        }
                    }
                }
            }
        }
    }
}