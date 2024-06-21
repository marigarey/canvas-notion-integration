# Canvas to Notion Integration

<img src="./img/canvasNotionIntegration.png" width="500"/>

## Introduction

Using this repository you will be able to export all of your assignments from Canvas to a Notion Database!
Following the instructions below will help you set up the database!


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
    Once the Token is generated, copy the Token string.

This string will be your **Canvas API Key**

> [!WARNING]
> Once you move away from that screen you will not be able to access the token string!
> Make sure to save the Token string now!

### 3. Notion API Key Access[^1]

Pull up the [Notion - My Integrations](https://www.notion.so/my-integrations) site and click `+ New Integration`

Enter the name of the integration (ie Canvas Notion Integration) and what workspace the Integration will apply to.
In the `Secrets` tab and copy the _Internal Integration Secret_ this will be your **Notion API Key**.

<img src="/img/NotionIntegration.gif" width="400">

### 4. Create Integration within Notion

Head to whatever Notion Page you want to put the database in and click on `...` in the top right.
Scroll down to `+ Add Connections`. Find and select the integration. Make sure to click confirm.

<img src="/img/NotionPermissions.gif" width="400">

### 5. Environment Variable `.env` file Setup
Create a `.env` file and replace all the <> with your own information.
*Keep the `NOTION_DATABASE` variable as is because it will be overwritten when you run the code*

```
CANVAS_API_URL=<example: https://canvas-page.edu>
CANVAS_API=<your canvas api token>
NOTION_PAGE=<page id of the parent page to create the database>
NOTION_API=<your notion api key>
NOTION_DATABASE='default'
```

### 6. Run Code

```zhs
node main.js
```

> [!IMPORTANT]
> To update your database you will have to run the script every time there is a change in Canvas
> It is recomended to rerun the code every semester or class/assignment changes

## Other Information

In the future I do plan to add more to this, possibly blocks outside of the database.
If you have any suggestions on what I should, please let me know! I want to hear your feedback and improve!

> [!NOTE]
> The ID Property is for internal use and you can hide it in your database
> Hiding a Property:
> 1. Go to `...` on the top right of your database
> 2. Click on the `Properties` Tab
> 3. Click the eye on the `ID` Property
> 4. It should get crossed out and disapear from your database!

[^1]: (Source of Gifs and for more information on Notion Integrations)[https://developers.notion.com/docs/create-a-notion-integration]


