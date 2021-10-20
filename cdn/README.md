# Fosscord-CDN

CDN for Fosscord

## Run localy:

```
npm i
node dist/
```

## Endpoints:

### POST `/attachments/<filename>`

```
Content-Type: form-data

attachment: File (binary-data)
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

### GET `/attachments/<id>/<filename>`

```
requests image from database with given <id> and <filename>
```

##### Returns:

```
Content-Type: image/<imageType(png,img,gif)>
Image
```

### DELETE `/attachments/<id>/<filename>`

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

### POST `/external`

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

### GET `/external/<id>/<filename>`

-   requests cached crawled image

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
