# Canvas to Notion Integration

<img src="./img/CanvasToNotion.png" width="500"/>

## Introduction

Using this repository you will be able to export all of your assignments from Canvas to a Notion Database!
Following the instructions below will help you set up the database!

I will be updating the 

## Using the Canvas to Notion Integration

### 1. Project Setup

```zsh
# Clone this repository to your computer
gh repo clone marilg/canvas-notion-integration

# Open this project
cd canvas-notion-integration

# Install dependencies
npm install
```

### 2. Canvas Token Access

Go to your Canvas Profile Settings and scroll down to `Approved Integrations`.
<img src="img/CanvasIntegrationNAT.png">
    Click on `+ New Access Token` to create the token.

<img src="img/CanvasIntegrationToken.png">
    Name your Token, and leave the date blank to have no expiration date.

<img src="img/CanvasIntegrationDetails.png">
    Once the Token is generated, copy the Token string

> [!WARNING]
> Once you move away from that screen you will not be able to access the token string!
> Make sure to save the Token string now!

### 3. Notion API Key Access

### 4. Notion Integration Creation

### 5. Connect Integration Within Notion

### 6. Environment Variable `.env` file Setup

```
CANVAS_API_URL=<example: https://canvas-page.edu>
CANVAS_API=<your canvas api token>
NOTION_PAGE=<page id of the parent page to create the database>
NOTION_API=<your notion api key>
NOTION_DATABASE='default'
```

### 7. Run Code

```zhs
node main.js
```

> [!IMPORTANT]
> To update your database you will have to run the script every time there is a change in Canvas
> It is recomended to rerun the code every semester or class/assignment changes

## Other Information

> [!NOTE]
> The ID Property is for internal use and you can hide it in your database
> Hiding a Property:
> 1. Go to `...` on the top right of your database
> 2. Click on the `Properties` Tab
> 3. Click the eye on the `ID` Property
> 4. It should get crossed out and disapear from your database!


