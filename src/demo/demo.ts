import Skyweb from "../lib/skyweb";

let username = process.argv[2];
let password = process.argv[3];
if (!username || !password) {
  throw new Error("Username and password should be provided as commandline arguments!");
}

let skyweb = new Skyweb();
skyweb.login(username, password).then((skypeAccount) => {
  console.log("Skyweb is initialized now");
  console.log("Here is some info about you:" + JSON.stringify(skyweb.skypeAccount.selfInfo, null, 2));
  console.log("Your contacts : " + JSON.stringify(skyweb.contactsService.contacts, null, 2));
  console.log("Going incognito.");
  skyweb.setStatus("Hidden");
});
skyweb.authRequestCallback = (requests) => {
  requests.forEach((request) => {
    skyweb.acceptAuthRequest(request.sender);
    skyweb.sendMessage("8:" + request.sender, "I accepted you!");
  });
};
skyweb.messagesCallback = (messages) => {
  messages.forEach((message)=> {
    if (message.resource.from.indexOf(username) === -1 && message.resource.messagetype !== "Control/Typing" && message.resource.messagetype !== "Control/ClearTyping") {
      let conversationLink = message.resource.conversationLink;
      let conversationId = conversationLink.substring(conversationLink.lastIndexOf("/") + 1);
      skyweb.sendMessage(conversationId, message.resource.content + ". Cats will rule the World");
    }
  });
};
