import { google } from "googleapis";

export type GmailClientInput = {
  accessToken: string;
  refreshToken: string;
};

export type GmailClientResult = {
  gmail: ReturnType<typeof google.gmail>;
  oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  accessToken: string;
};

export const createGmailClient = async ({
  accessToken,
  refreshToken,
}: GmailClientInput): Promise<GmailClientResult> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth client credentials.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const refreshed = await oauth2Client.getAccessToken();
  const activeAccessToken = refreshed.token ?? accessToken;

  oauth2Client.setCredentials({
    access_token: activeAccessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  return {
    gmail,
    oauth2Client,
    accessToken: activeAccessToken,
  };
};
