# Gmail API Documentation - OAuth & Push Notifications

Source: Context7 - `/websites/developers_google_workspace_gmail_api`

## OAuth 2.0 Authentication Setup

### Overview
The Gmail API uses OAuth 2.0 for authentication and authorization. The flow involves generating an authorization URL, redirecting users to consent, and exchanging the authorization code for credentials.

### 1. Generate Authorization URL

```python
from oauth2client.client import flow_from_clientsecrets

def get_authorization_url(email_address, state):
  """Retrieve the authorization URL.

  Args:
    email_address: User's e-mail address.
    state: State for the authorization URL.

  Returns:
    Authorization URL to redirect the user to.
  """
  flow = flow_from_clientsecrets(CLIENTSECRETS_LOCATION, ' '.join(SCOPES))
  flow.params['access_type'] = 'offline'
  flow.params['approval_prompt'] = 'force'
  flow.params['user_id'] = email_address
  flow.params['state'] = state
  # The step1_get_authorize_url method uses the flow.redirect_uri attribute.
  flow.redirect_uri = REDIRECT_URI
  return flow.step1_get_authorize_url()
```

**Key Parameters:**
- `access_type = 'offline'` - Enables refresh tokens for long-term access
- `approval_prompt = 'force'` - Forces the consent screen to appear
- `redirect_uri` - Where Google redirects after user consent

### 2. Exchange Authorization Code for Credentials

```python
from oauth2client.client import flow_from_clientsecrets, FlowExchangeError
import logging

def exchange_code(authorization_code):
  """Exchange an authorization code for OAuth 2.0 credentials.

  Args:
    authorization_code: Authorization code to exchange for OAuth 2.0
                        credentials.

  Returns:
    oauth2client.client.OAuth2Credentials instance.

  Raises:
    CodeExchangeException: an error occurred.
  """
  flow = flow_from_clientsecrets(CLIENTSECRETS_LOCATION, ' '.join(SCOPES))
  flow.redirect_uri = REDIRECT_URI
  try:
    credentials = flow.step2_exchange(authorization_code)
    return credentials
  except FlowExchangeError as error:
    logging.error('An error occurred: %s', error)
    raise CodeExchangeException(None)
```

### Gmail API Scopes

Authorization scopes define the level of access your app has. Choose the most narrowly focused scope possible.

**Common Scopes:**
- Full access: Use when you need complete mailbox control
- Read-only: For apps that only need to read emails
- Send: For apps that only send emails
- Compose: For apps that create drafts
- Modify: For apps that modify but don't delete

**Note:** Users more readily grant access to limited, clearly described scopes.

---

## Watch() Push Notifications

### Overview
The `watch()` method enables real-time notifications for Gmail mailbox changes via Google Cloud Pub/Sub. This eliminates the need for constant polling.

### Prerequisites
1. Set up a Google Cloud Pub/Sub topic
2. Grant Gmail API permission to publish to your topic
3. Configure a webhook endpoint or pull subscription

### API Endpoint

```
POST /gmail/v1/users/{userId}/watch
```

### Parameters

**Path Parameters:**
- `userId` (string, required) - The user's email address. Use "me" for authenticated user.

**Request Body:**
- `topicName` (string, required) - Full Cloud Pub/Sub topic name
  - Format: `projects/{project_id}/topics/{topic_id}`
- `labelIds` (array of strings, optional) - Filter changes by label IDs
- `labelFilterBehavior` (string, optional) - `INCLUDE` or `EXCLUDE`
  - Default: `INCLUDE`

### Request Example

```json
POST https://www.googleapis.com/gmail/v1/users/me/watch
Content-type: application/json

{
  "topicName": "projects/myproject/topics/mytopic",
  "labelIds": ["INBOX"],
  "labelFilterBehavior": "INCLUDE"
}
```

### Response Example

```json
{
  "historyId": "1234567890",
  "expiration": 1431990098200
}
```

**Response Fields:**
- `historyId` (string) - Current mailbox history ID. All changes after this ID will be notified.
- `expiration` (integer) - Timestamp in milliseconds when the watch expires.

---

## Receiving Notifications

### Webhook Push Notification Structure

When a mailbox update occurs, a `PubsubMessage` is sent to your configured webhook URL.

### Request to Your Webhook

```
POST https://yourserver.example.com/yourUrl
Content-type: application/json
```

### Notification Payload

```json
{
  "message": {
    "data": "eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAiMTIzNDU2Nzg5MCJ9",
    "messageId": "2070443601311540",
    "publishTime": "2021-02-26T19:13:55.749Z"
  },
  "subscription": "projects/myproject/subscriptions/mysubscription"
}
```

### Decoded Data Payload

The `message.data` field is a base64url-encoded JSON string:

```json
{
  "emailAddress": "user@example.com",
  "historyId": "9876543210"
}
```

### Processing Notifications

1. **Acknowledge the notification** - Respond with HTTP 200
2. **Decode the data field** - Base64url decode `message.data`
3. **Extract historyId** - Use this to sync changes
4. **Call history.list** - Retrieve specific changes since last known history ID

### Example Flow

```
1. Initial watch() call returns historyId: "1000"
2. Notification received with historyId: "1050"
3. Call history.list with:
   - startHistoryId: "1000"
   - Gets all changes between 1000 and 1050
4. Save "1050" as last known history ID
5. Next notification uses "1050" as startHistoryId
```

---

## Important Notes

### Watch Expiration
- Watches expire after 7 days or at the timestamp in the expiration field
- Renew watches before expiration by calling `watch()` again
- Monitor expiration timestamps and implement auto-renewal

### Error Handling
- **400 Bad Request** - Invalid request body or parameters
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Topic or user doesn't exist
- **500 Internal Server Error** - Unexpected server error

### Best Practices
1. Use the most restrictive scopes possible
2. Implement exponential backoff for retries
3. Handle webhook failures gracefully
4. Store historyId for sync continuity
5. Validate webhook requests (verify they're from Google)
6. Monitor watch expiration and renew proactively

---

## Additional Resources

- [Gmail API Push Notifications Guide](https://developers.google.com/workspace/gmail/api/guides/push)
- [Gmail API Scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [OAuth 2.0 for Web Server Apps](https://developers.google.com/workspace/gmail/api/auth/web-server)
