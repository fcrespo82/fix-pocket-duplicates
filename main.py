#!/usr/bin/env python

import requests
import json
import webbrowser
import os

from secrets import CONSUMER_KEY

ENDPOINTS = {
    "REQUEST_TOKEN": "https://getpocket.com/v3/oauth/request",
    "AUTHORIZE": "https://getpocket.com/auth/authorize?request_token={code}&redirect_uri={redirect_url}",
    "ACCESS_TOKEN": "https://getpocket.com/v3/oauth/authorize",
    "GET": "https://getpocket.com/v3/get"
}

POCKET_HEADERS = {
    "Content-Type": "application/json; charset=UTF8",
    "X-Accept": "application/json"
}

CODE_FILE = "pocket-code.json"

s = requests.session()

def save_code(the_code):
    code_file = open(CODE_FILE, 'w+')
    data = { "code": the_code }

    json.dump(data, code_file)
    
def load_code():
    code_file = open(CODE_FILE, 'r')
    return json.load(code_file)["code"]
    
def request_token(session):
    payload = {
        "consumer_key": CONSUMER_KEY,
        "redirect_uri": "http://getpocket.com"
    }
    r = session.post(ENDPOINTS["REQUEST_TOKEN"], data=json.dumps(payload), headers=POCKET_HEADERS)

    save_code(r.json()["code"])

    return r.json()["code"]

def authorize(the_code):
    payload = {
        "code": the_code,
        "redirect_url": "http://getpocket.com"
    }
    endpoint_authorize = ENDPOINTS["AUTHORIZE"].format(**payload)
    webbrowser.open_new_tab(endpoint_authorize)
    raw_input("After authorize press ENTER")

def access_token(session, the_code):
    payload = {
        "consumer_key": CONSUMER_KEY,
        "code": the_code
    }
    r = session.post(ENDPOINTS["ACCESS_TOKEN"], data=json.dumps(payload), headers=POCKET_HEADERS)

    return r.json()["access_token"]

def authenticated_get(session, the_token):
    payload = {
        "consumer_key": CONSUMER_KEY,
        "access_token": the_token#,
        #"count": 100
    }
    r = session.post(ENDPOINTS["GET"], data=json.dumps(payload), headers=POCKET_HEADERS)

    return r.json()


if (not os.path.exists(CODE_FILE)):
    code = request_token(s) 
    authorize(code)
else:
    code = load_code()
    

accesstoken = access_token(s, code)

items = authenticated_get(s, accesstoken)

all_items = items["list"]

possible_duplicates = [item for item in all_items.itervalues() if item["item_id"] != item["resolved_id"] and item["resolved_id"] != "0"] 


# print("possible")
# for possible_item in possible_duplicates:
#     print(possible_item["resolved_id"])

# print("all")
# for item in all_items.itervalues():
#     print(item["resolved_id"])

for possible_item in possible_duplicates:
    for item in all_items.itervalues():
        #print(item["resolved_id"], possible_item["resolved_id"])
        if (item["resolved_id"] == possible_item["resolved_id"] or possible_item["resolved_id"] == item["item_id"]) and item["item_id"] != possible_item["item_id"] and item["item_id"] == item["resolved_id"]:
            print(item["item_id"], item["resolved_id"], possible_item["item_id"], possible_item["resolved_id"], possible_item)
            #print("Duplicado esta na minha lista")
            
    

