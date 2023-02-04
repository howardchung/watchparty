import requests

url = "https://discord.com/api/v10/applications/1071394728513380372/commands"

# This is an example CHAT_INPUT or Slash Command, with a type of 1
json = {
    "name": "watch",
    "type": 1,
    "description": "Start a new WatchParty",
    "options": [
        {
            "name": "video",
            "description": "The URL to start watching",
            "type": 3
        }
    ]
}

# For authorization, you can use either your bot token
headers = {
    "Authorization": "Bot <TOKEN>"
}

# or a client credentials token for your app with the applications.commands.update scope
# headers = {
#     "Authorization": "Bearer <my_credentials_token>"
# }

r = requests.post(url, headers=headers, json=json)