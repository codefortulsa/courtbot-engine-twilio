import log4js from "log4js";
import { sendMessage, sendNonReplyMessage, verifyNumber } from "./twilio";
import {events as emitter} from "courtbot-engine";
import {CourtbotConversation} from "courtbot-engine";

export default function(name, options) {
  const communicationType = "sms" + (name || "");

  emitter.on("query-communication-types", (types) => types.push(communicationType));

  emitter.on("add-routes", ({router, registrationSource, messageSource}) => {
    router.post("/sms", function(req,res) {
      log4js.getLogger("sms").debug("Incomming request", req.body);

      var text = req.body.Body.toUpperCase().trim();
      var phone = req.body.From;
      var conversation = new CourtbotConversation(communicationType, registrationSource, messageSource);

      conversation.on("reply", (reply, result) => {
        result.promise = sendMessage(reply, res);
      });

      conversation.parse(text, phone);
    });
  });

  emitter.on("send-non-reply", (data) => {
    if(data.communicationType === communicationType) {
      data.result.promises.push(sendNonReplyMessage(data.to, data.msg, options));
    }
  });

  emitter.on("verify-contact", (data) => {
    if(data.communicationType === communicationType) {
      data.result.promises.push(verifyNumber(data.contact, options));
    }
  });
}
