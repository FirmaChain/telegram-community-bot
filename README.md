# FirmaChain Official Telegram Group Bot
![firmachain official bot](https://user-images.githubusercontent.com/93503020/163318773-268e9605-5e9f-4004-b2fa-0a3c05b7545c.png)
<p>
The telegram-community-bot manages users who join 'FirmaChain Global Official' Telegram group.
</p>
</br>
## Telegram Setting

### 1. Create bot
![create_new_bot](https://user-images.githubusercontent.com/93503020/163318906-4ff53d84-d915-47ca-8175-46cf06993a13.png)

<p>
Start a chat with @BotFather and create a bot.
Please enter in the order below.
</p>

```
1. /newbot
2. Bot name that ends with 'bot'. (Check)
3. Bot name that ends with 'bot'. (Finished)
```

### 2. Create group
Change the group type to 'public' after creating the group.

### 3. Invite bots & Change bots permissions
![firmachain official bot admin](https://user-images.githubusercontent.com/93503020/163318929-4e36ea22-9ecf-4f8d-a4ed-466507985689.png)

<p>
Invite the 'bot' to the group to add it as an administrator and change the permissions as shown above.
</p>

## How to build Telegram Community Bot
###  1. Prepare the project directory and npm.
```
git clone https://github.com/FirmaChain/telegram-community-bot.git
npm install
```

### 2. Set Config
##### 2-1. config directory
Please create a config directory on the root path.

##### 2-2. 'locale.config.json'
Copy the 'locale.config.json' file in the 'sample' directory under the 'config' directory.
And fill in the appropriate 'json' information in the 'locale.config.json' file in the config directory.

##### 2-3. '.env.production'
Copy the '.env.sample' file in the 'sample' path to the 'config' path with the file name '.env.production' and set the value.

### 3. Build and Run
```
npm install
npm run start
```
