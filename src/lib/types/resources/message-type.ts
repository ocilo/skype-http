import { TsEnumType } from "kryo/types/ts-enum";

export enum MessageType {
  ControlClearTyping = "Control/ClearTyping",
  ControlLiveState = "Control/LiveState",
  ControlTyping = "Control/Typing",
  EventCall = "Event/Call",
  RichText = "RichText",
  RichTextUriObject = "RichText/UriObject",
  RichTextLocation = "RichText/Location",
  RichTextMediaGenericFile = "RichText/Media_GenericFile",
  RichTextMediaVideo = "RichText/Media_Video",
  SignalFlamingo = "Signal/Flamingo",
  Text = "Text",
}

export const $MessageType: TsEnumType<MessageType> = new TsEnumType<MessageType>({
  enum: MessageType,
  rename: {
    ControlClearTyping: "Control/ClearTyping",
    ControlLiveState: "Control/LiveState",
    ControlTyping: "Control/Typing",
    EventCall: "Event/Call",
    RichText: "RichText",
    RichTextUriObject: "RichText/UriObject",
    RichTextLocation: "RichText/Location",
    RichTextMediaGenericFile: "RichText/Media_GenericFile",
    RichTextMediaVideo: "RichText/Media_Video",
    SignalFlamingo: "Signal/Flamingo",
    Text: "Text",
  },
});
