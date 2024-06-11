from bs4 import BeautifulSoup
import requests as r
from dotenv import dotenv_values

config = dotenv_values(".env")

request = r.get(config.get("CANVAS_API_URL"))
soup = BeautifulSoup(request.text, "html.parser")
