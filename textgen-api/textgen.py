from fastapi import FastAPI
from openai import AzureOpenAI

app = FastAPI()

# Azure OpenAI client
client = AzureOpenAI(
    api_key="9JUaVXLdhd2ya7hMOXOk7eWAScArRqbqBBAkLz4UkNA0zYPzJW1cJQQJ99CEAC77bzfXJ3w3AAABACOGRZYG",   # replace with new key
    azure_endpoint="https://openai-lab37-hackathon.openai.azure.com/",
    api_version="2024-02-15-preview"
)

# Simple API
@app.get("/generate")
def generate(text: str):

    response = client.chat.completions.create(
        model="gpt-5-mini1",   # your deployment name
        messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": {text}}
    ]
,
        max_completion_tokens=200
    )
    
 


    return {
        "response": response.choices[0].message.content
    }
  