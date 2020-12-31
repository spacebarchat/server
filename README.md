# Discord-CDN
cdn for discord clone

## Endpoints:
### `/attachments/<filename>`
#### POST
```
Content-Type: form-data

attachment: File
```
##### Returns:
```
{
    "success": boolean,             // true
    "message": string,              // "attachment uploaded"
    "id": snowflake,                // "794183329158135808"
    "filename": string              // "lakdoiauej.png"
}
```
### `/attachments/<id>/<filename>`
#### GET
```
requests image from database with given <id> and <filename>
```
##### Returns:
```
Content-Type: image/<imageType(png,img,gif)>
Image
```
### `/attachments/<id>/<filename>`
#### DELETE
```
deletes database entry
```
##### Returns:
```
Content-Type: application/json

{
    "success": true,
    "message": "attachment deleted"
}
```

<hr>

_(endpoints for crawler):_
### `/external` 
#### POST
```
requests crawling of `og:`metadata and the download of the `og:image` property
--------
Content-Type: application/json

body:
{"url": URL}                  // "https://discord.com"
```
##### Returns:
```
Content-Type: application/json

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
- requests cached crawled image 
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
