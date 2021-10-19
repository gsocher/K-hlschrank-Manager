# -*- coding: utf-8 -*-

# This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK for Python.
# Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
# session persistence, api calls, and more.
# This sample is built using the handler classes approach in skill builder.
import logging
import os
import boto3
import ask_sdk_core.utils as ask_utils

from ask_sdk_core.skill_builder import CustomSkillBuilder
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.dispatch_components import AbstractExceptionHandler
from ask_sdk_core.handler_input import HandlerInput

from ask_sdk_model import Response

from ask_sdk_dynamodb.adapter import DynamoDbAdapter

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# initialize persistence adapter
ddb_region = os.environ.get('DYNAMODB_PERSISTENCE_REGION')
ddb_table_name = os.environ.get('DYNAMODB_PERSISTENCE_TABLE_NAME')

ddb_resource = boto3.resource('dynamodb', region_name=ddb_region)
dynamodb_adapter = DynamoDbAdapter(table_name=ddb_table_name, create_table=False, dynamodb_resource=ddb_resource)

# RequestHandler

class LaunchRequestHandler(AbstractRequestHandler):
    """Handler for Skill Launch."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool

        return ask_utils.is_request_type("LaunchRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        speak_output = "Hier ist der Kühlschrank Manager. Ich kann Dir sagen, was im Kühlschrank ist."

        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask(speak_output)
                .response
        )


class AddToFridgeIntentHandler (AbstractRequestHandler):
    """Handler for AddToFridge Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("AddToFridgeIntent")(handler_input)

    def handle(self, handler_input):
        
        # slot values: what was put in the fridge
        slots = handler_input.request_envelope.request.intent.slots
        foodItem = slots["FoodItem"].value
        number = slots["Number"].value
        foodUnit = slots["FoodUnit"].value
        
        logger.info ("FoodItem %s", foodItem)
        logger.info ("Number %s", number)
        logger.info ("FoodUnit %s", foodUnit)
        
        attr = handler_input.attributes_manager.persistent_attributes
        if not attr:
            # fridge is empty, intialize
            attr['infridge'] = []
            
        if foodItem is None:
            # foodItem is undefined
            speak_output = "Was genau hast Du in den Kühlschrank gelegt?"
        else:
            # add foodItem to fridge 
            # todo: make sure that the nummber of foodItems is added correctly
            attr['infridge'].append(foodItem)
            logger.info ("Persistent Attributes {}".format(' '.join(attr['infridge'])))
            handler_input.attributes_manager.save_persistent_attributes()
            speak_output = "OK. {}.".format(foodItem)
            logger.info(speak_output)
           
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask("Bitte sage mir, was Du in den Kühlschrank gelegt hast.")
                .response
        )


class TakeOutFromFridgeIntentHandler (AbstractRequestHandler):
    """Handler for TakeOutFromFridge Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("TakeOutFromFridgeIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        speak_output = "Das ist noch nicht implementiert."

        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask("Bitte sage mir, was Du aus dem Kühlschrank genommen hast.")
                .response
        )


class WhatIsInMyFridgeIntentHandler  (AbstractRequestHandler):
    """Handler for WhatIsInMyFridge Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("WhatIsInMyFridgeIntent")(handler_input) 

    def handle(self, handler_input):
        attr = handler_input.attributes_manager.persistent_attributes
        if not attr or len(attr['infridge']) < 1:
            speak_output = "Dein Kühlschrank ist leer. Vielleicht solltest Du einkaufen gehen."
        else:
            if len(attr['infridge']) == 1:
                infridge = ''.join(attr['infridge'])
            elif len(attr['infridge']) == 2:
                infridge = ' und '.join(attr['infridge'])
            else:
                infridge = '{} und {}'.format(', ').join(attr['infridge'][:-1], attr['infridge'][-1])

            speak_output = "Ich sehe im Kühlschrank {}.".format(infridge)
            logger.info(speak_output)
        
        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask("Du kannst mich fragen was in deinem Kühlschrank ist.")
                .response
        )


class EmptyFridgeIntentHandler (AbstractRequestHandler):
    """Handler for EmptyFridge Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("EmptyFridgeIntent")(handler_input)

    def handle(self, handler_input):
        attr = handler_input.attributes_manager.persistent_attributes
        attr['infridge'] = []
        handler_input.attributes_manager.save_persistent_attributes()
        # type: (HandlerInput) -> Response
        speak_output = "Der Kühlschrank ist wieder leer."

        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask("Es ist nichts mehr im Kühlschrank.")
                .response
        )


class HelpIntentHandler(AbstractRequestHandler):
    """Handler for Help Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("AMAZON.HelpIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        speak_output = "Ich helfe Dir Ordnung in Deinem Kühlschrank zu halten. Frage Was ist in meinem Kühlschrank oder sage mir welche Nahrungsmittel Du in den Kühlschrank legst oder heraus nimmst."

        return (
            handler_input.response_builder
                .speak(speak_output)
                .ask("Frage mich was im Kühlschrank ist.")
                .response
        )


class CancelOrStopIntentHandler(AbstractRequestHandler):
    """Single handler for Cancel and Stop Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return (ask_utils.is_intent_name("AMAZON.CancelIntent")(handler_input) or
                ask_utils.is_intent_name("AMAZON.StopIntent")(handler_input))

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        speak_output = "Auf Wiedersehen!"

        return (
            handler_input.response_builder
                .speak(speak_output)
                .response
        )


class FallbackIntentHandler(AbstractRequestHandler):
    """Single handler for Fallback Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("AMAZON.FallbackIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        logger.info("In FallbackIntentHandler")
        speech = "Hmm, das habe ich jetzt nicht verstanden. Hast Du etwas in den Kühlschrank gelegt oder herausgenommen?"
        reprompt = "Leider nicht verstanden. Soll ich Dir sagen was im Kühlschrank ist?"

        return handler_input.response_builder.speak(speech).ask(reprompt).response


class SessionEndedRequestHandler(AbstractRequestHandler):
    """Handler for Session End."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_request_type("SessionEndedRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        # Any cleanup logic goes here.

        return handler_input.response_builder.response


class IntentReflectorHandler(AbstractRequestHandler):
    """The intent reflector is used for interaction model testing and debugging.
    It will simply repeat the intent the user said. You can create custom handlers
    for your intents by defining them above, then also adding them to the request
    handler chain below.
    """
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_request_type("IntentRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        intent_name = ask_utils.get_intent_name(handler_input)
        speak_output = "Du hast " + intent_name + " aufgerufen."

        return (
            handler_input.response_builder
                .speak(speak_output)
                # .ask("add a reprompt if you want to keep the session open for the user to respond")
                .response
        )


class CatchAllExceptionHandler(AbstractExceptionHandler):
    """Generic error handling to capture any syntax or routing errors. If you receive an error
    stating the request handler chain is not found, you have not implemented a handler for
    the intent being invoked or included it in the skill builder below.
    """
    def can_handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> bool
        return True

    def handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> Response
        logger.error(exception, exc_info=True)

        speak_output = "Wie bitte?"

        return (
            handler_input.response_builder
                .speak(speak_output)
                .response
        )


# The SkillBuilder object acts as the entry point for your skill, routing all request and response
# payloads to the handlers above. Make sure any new handlers or interceptors you've
# defined are included below. The order matters - they're processed top to bottom.



sb = CustomSkillBuilder(persistence_adapter = dynamodb_adapter)

sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(AddToFridgeIntentHandler())
sb.add_request_handler(TakeOutFromFridgeIntentHandler())
sb.add_request_handler(WhatIsInMyFridgeIntentHandler())
sb.add_request_handler(EmptyFridgeIntentHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(CancelOrStopIntentHandler())
sb.add_request_handler(FallbackIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())
sb.add_request_handler(IntentReflectorHandler()) # make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers

sb.add_exception_handler(CatchAllExceptionHandler())

lambda_handler = sb.lambda_handler()