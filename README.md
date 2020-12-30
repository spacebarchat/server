# discord-cdn
cdn for discord clone

## Endpoints:

### `/external` 
#### POST
```
Content-Type: application/json

body:
{"url": URL}                  // "https://discord.com"
```
##### Returns:
Content-Type: application/json
```ts
{
    "id": string,             // "aHR0cHM6Ly9kaXNjb3JkLmNvbQ=="
    "ogTitle": string,        // "Discord | Your Place to Talk and Hang Out"
    "ogDescription": string,  // "Discord is the easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities."
    "cachedImage": string,    // "/external/aHR0cHM6Ly9kaXNjb3JkLmNvbQ==/discord.png"
    "ogUrl": string,          // "https://discord.com/"
    "ogType": string          // "website"
}
```
### `/external/<id>/<filename>`
#### GET
```
url-params:
    :id                       // aHR0cHM6Ly9kaXNjb3JkLmNvbQ==
    :filename                 // discord.png
```
```
/external/aHR0cHM6Ly9kaXNjb3JkLmNvbQ==/discord.png
```
##### Returns:
```
Content-Type: image/<imageType(png,img,gif)>
Image
```
