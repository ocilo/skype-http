import { Incident } from "incident";
import { MediaDownloaded } from "../interfaces/api/api";
import { Context } from "../interfaces/api/context";
import { FileResource } from "../interfaces/api/resources";
import * as io from "../interfaces/http-io";

export async function getImage(
  io: io.HttpIo,
  apiContext: Context,
  messageResource: FileResource,
): Promise<MediaDownloaded> {

  const originUri: string = messageResource.uri +
    (messageResource.type === "RichText/UriObject" ?
    "/views/imgpsh_fullsize" :
      messageResource.type === "RichText/Media_GenericFile" ?
        "/views/original" : "");

  if (originUri === messageResource.uri) {
    return Promise.reject(new Incident("get-media", "Received wrong type of resource file"));
  }

  const requestOptions: io.GetOptions = {
    uri: originUri,
    headers: {
      Authorization: "skype_token " + apiContext.skypeToken.value,
    },
  };

  const res: io.Response = await io.getImageContent(requestOptions);

  if (res.statusCode !== 200) {
    return Promise.reject(new Incident("get-media", "Received wrong return code"));
  }

  return {
    content: res.body,
    uri_origin: originUri,
    file_size: parseInt(res.headers["content-length"], 10),
    original_file_name: messageResource.original_file_name,
  };
}
