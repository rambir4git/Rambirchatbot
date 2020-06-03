// Rambir making this .js script for Mekbot running DialogFlow (api.ai)
// 7 Apr 2020

// This script will run on the firebase function instance
// This will provide us a custom end point for sending a question to our chatbot
// peace _V_


'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000 
const dialogflow = require('dialogflow');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements


express()
  .use(bodyParser.json())
  .post('/', (request, response)=> {  
  
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
    const projectId = 'mekbot-7a8c7';
    const languageCode = 'en';
    const query = request.body.question; 
	const contexts = request.body.context;
    const sessionId = request.body.sessionId;
	const auth = request.headers.authorization;
	
    const sessionClient = new dialogflow.SessionsClient({
                keyFilename: "./mekbot-dialogflow-integration.json"  
       });
	
    async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
		
        // The path to identify the agent that owns the created intent.
        const sessionPath = sessionClient.sessionPath(projectId, sessionId);

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: query,
                    languageCode: languageCode,
                },
            },
        };

        if (contexts && contexts.length > 0) {
            request.queryParams = {
                contexts: contexts,
            };
        }
		else{
			request.queryParams = {
					contexts: [{
						"name": "projects/"+projectId+"/agent/sessions/"+sessionId+"/contexts/auth",
						"lifespanCount": 100,
						"parameters": {
								"fields": {
									"auth": {
										 "stringValue": auth,
										 "kind": "stringValue"
									 },
									"auth.original": {
										 "stringValue": auth,
											 "kind": "stringValue"
									}
								}
						}
					}],
				};
		}

        const responses = await sessionClient.detectIntent(request);
	    return responses;
    }

    async function executeQuery(projectId, sessionId, query, languageCode) {
        
        try {
            console.log(`Sending Query: ${query}`);
            const intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                contexts,
                languageCode
            );
            console.log('Detected intent');
            console.log('Response: ' + JSON.stringify(intentResponse[0]));
            response.send(intentResponse[0]);
			
        } catch (error) {
            console.log(error);
        } finally{
            console.log('Query execution complete');
        }
    }

    return executeQuery(projectId, sessionId, query, languageCode); 
})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
  
  
  