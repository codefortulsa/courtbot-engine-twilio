import twilio from "twilio";
import log4js from "log4js";

export function sendMessage(msg, res) {
  const twiml = new twilio.TwimlResponse();
  log4js.getLogger("twilio-response").info("Sending reply.", msg);
  twiml.sms(msg);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

  return Promise.resolve(msg);
}

export function sendNonReplyMessage(phone, message, opt) {
  const logger = log4js.getLogger("twilio-non-respose");
  logger.info("Sending non reply message.", {message, phone, from: opt.twilioPhone});
  return new Promise(function(resolve, reject) {
    var client = twilio(opt.twilioAccount, opt.twilioToken);
    logger.debug("twilio client initialized", client);
    client.sendMessage({to: phone, from: opt.twilioPhone, body: message}, function(err) {
      if(err) {
        logger.error("Error sending message:", err);
        reject(err);
        return;
      }
      logger.info("Twilio message sent successfully");
      resolve();
    });
  });
}

export function verifyNumber(number, opt) {
  const logger = log4js.getLogger("twilio-verify-number");
  logger.info("verifying number", number);
  return new Promise(function(resolve, reject) {
    var client = new twilio.LookupsClient(opt.twilioAccount, opt.twilioToken);
    client.phoneNumbers(number).get((error, number) => {
      if(error)reject(error);
      resolve(number.phone_number);
    })
  });
}
