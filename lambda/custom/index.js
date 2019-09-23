// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hier ist der Kühlschrank Manager. Ich kann Dir sagen, was im Kühlschrank ist.';
        console.log(speakOutput);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const AddToFridgeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddToFridgeIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Was genau hast Du in den Kühlschrank gelegt?';
        const foodItem = handlerInput.requestEnvelope.request.intent.slots.FoodItem.value;
        console.log(foodItem);

        const { attributesManager } = handlerInput;
        const attributes = await attributesManager.getPersistentAttributes() || {};

        // nothing in fridge yet
        if (Object.keys(attributes).length === 0) {
            attributes.inFridge = [];
        }
        if (foodItem !== undefined) {
            attributes.inFridge.push(foodItem);
            attributesManager.setPersistentAttributes(attributes);
            await attributesManager.savePersistentAttributes();
            speakOutput = `Ok. Du hast ${foodItem} in den Kühlschrank gelegt.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Bitte sage mir, was Du in den Kühlschrank gelegt hast.')
            .getResponse();
    }
};

const TakeOutFromFridgeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'TakeOutFromFridgeIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Was hast Du aus dem Kühlschrank genommen?';
        const foodItem = handlerInput.requestEnvelope.request.intent.slots.FoodItem.value;

        const { attributesManager } = handlerInput;
        const attributes = await attributesManager.getPersistentAttributes() || {};

        // nothing in fridge yet
        if (Object.keys(attributes).length === 0) {
            speakOutput = 'Oh, Ich glaube Dein Kühlschrank ist leer. Sage mir zuerst was in Deinem Kühlschrank ist.';
        }
        if (attributes.inFridge.length === 0) {
            speakOutput = 'Meine Kühlschrankliste ist leer. Sage mir zuerst was in Deinem Kühlschrank ist.';
        }

        console.log(foodItem);

        if (foodItem !== undefined) {
            speakOutput = `Ich kann ${foodItem} nicht im Kühlschrank finden.`;
            //remove foodItem
            for (var i = 0; i < attributes.inFridge.length; i++) {
                if (attributes.inFridge[i] === foodItem) {
                    attributes.inFridge.splice(i, 1);
                    speakOutput = `Ok. Du hast ${foodItem} aus dem Kühlschrank genommen.`;
                }
            }
            attributesManager.setPersistentAttributes(attributes);
            await attributesManager.savePersistentAttributes();
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Bitte sage mir, was Du aus dem Kühlschrank genommen hast.')
            .getResponse();
    }
};


const WhatIsInMyFridgeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatIsInMyFridgeIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Hmm, leider weiß ich nicht, was in Deinem Kühlschrank ist.';
        //const foodItem = handlerInput.requestEnvelope.request.intent.slots.FoodItem.value;

        const { attributesManager } = handlerInput;
        const attributes = await attributesManager.getPersistentAttributes() || {};

        console.log(attributes);

        // nothing in fridge yet
        if (Object.keys(attributes).length === 0 || attributes.inFridge.length === 0) {
            speakOutput = 'Dein Kühlschrank ist leer. Vielleicht solltest Du einkaufen gehen.';
        } else {
            if (attributes.inFridge.length === 1) {
                speakOutput = 'Im Kühlschrank ist ' + attributes.inFridge[0];
            }
            if (attributes.inFridge.length === 2) {
                speakOutput = 'Im Kühlschrank sind ' + attributes.inFridge[0] + ' und ' + attributes.inFridge[1];
            } else {
                speakOutput = 'Im Kühlschrank sind ';
                for (let i = 0, len = attributes.inFridge.length - 1; i < len; i += 1) {
                    speakOutput = speakOutput + attributes.inFridge[i] + ' ';
                }
                speakOutput = speakOutput + ' und ' + attributes.inFridge[attributes.inFridge.length - 1];
            }
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Sage mir, wenn Du etwas aus dem Kühlschrank nimmst oder etwas hineinlegst.')
            .getResponse();
    }
};

const EmptyFridgeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'EmptyFridgeIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Der Kühlschrank ist wieder leer.';

        const { attributesManager } = handlerInput;
        const attributes = await attributesManager.getPersistentAttributes() || {};

        // nothing in fridge yet
        if (Object.keys(attributes).length === 0) {
            speakOutput = 'Dein Kühlschrank war schon leer.';
        }

        attributes.inFridge = [];
        attributesManager.setPersistentAttributes(attributes);
        await attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Was möchtest Du in den Kühlschrank legen?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Ich helfe Dir Ordnung in Deinem Kühlschrank zu halten. Frage Was ist in meinem Kühlschrank oder sage mir welche Nahrungsmittel Du in den Kühlschrank legst oder heraus nimmst.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Auf Wiedersehen!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Du hast ${intentName} aufgerufen.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Ups, das habe ich nicht verstanden. Bitte wiederhole.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// needed for persistence
function getPersistenceAdapter() {
    // Determines persistence adapter to be used based on environment
    // Note: tableName is only used for DynamoDB Persistence Adapter
    if (process.env.S3_PERSISTENCE_BUCKET) {
        // in Alexa Hosted Environment
        // eslint-disable-next-line global-require
        const s3Adapter = require('ask-sdk-s3-persistence-adapter');
        return new s3Adapter.S3PersistenceAdapter({
            bucketName: process.env.S3_PERSISTENCE_BUCKET,
        });
    }
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .withPersistenceAdapter(getPersistenceAdapter())
    .addRequestHandlers(
        LaunchRequestHandler,
        AddToFridgeIntentHandler,
        TakeOutFromFridgeIntentHandler,
        WhatIsInMyFridgeIntentHandler,
        EmptyFridgeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();