import json
from dataclasses import dataclass
from functools import cache

import requests


BUILD_FOLDER = "build"
MANIFEST_LOCATION = f"{BUILD_FOLDER}/resources/manifest.txt"
TOKEN_FILE = "bitburner_auth_token.txt"

@dataclass
class BitBurnerGameConfig:
    port: int
    schema: str
    url: str
    file_post_uri: str
    valid_file_extensions: list[str]

GAME_CONFIG = BitBurnerGameConfig(
    port=9990,
    schema="http",
    url="localhost",
    file_post_uri="/",
    valid_file_extensions=[".js", ".script", ".ns", ".txt"]
)


def push_file(filepath: str):
    """
    Push a file into the game, maintaining its path minus "build/"
    """
    filepath = filepath.strip()
    if not any([filepath.endswith(file_ext) for file_ext in GAME_CONFIG.valid_file_extensions]):
        print(f"Skipping file {filepath} because it does not have a valid file extension")

    sanitized_filepath = sanitize_filepath(filepath)

    contents = None
    with open(f"build/{sanitized_filepath}") as f:
        contents = f.read()

    print(f"Pushing to {sanitized_filepath}")
    body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "pushFile",
        "params": {
            "filename": sanitized_filepath,
            "content": contents,
            "server": "home"
        }
    }
    body_str = json.dumps(body)

    resp = requests.post(
        url=f"{GAME_CONFIG.schema}://{GAME_CONFIG.url}:{GAME_CONFIG.port}{GAME_CONFIG.file_post_uri}",
        data=body_str,
        headers={
            "Authorization": f"Bearer {get_auth_token()}",
            "Content-Type": "application/json",
            "Content-Length": str(len(body_str)) 
        }
    )
    
    print(resp.json())
    resp.raise_for_status()


def sanitize_filepath(filepath: str) -> str:
    sanitized = filepath
    if sanitized.startswith("./"):
        sanitized = f"{sanitized[2:]}"
    # if not sanitized.startswith("/"):
    #     sanitized = "/" + sanitized
    return sanitized


@cache
def get_auth_token() -> str:
    with open(TOKEN_FILE) as f:
        return f.read().strip()


def main():
    with open(MANIFEST_LOCATION) as manifest_file:
        for filepath in manifest_file:
            push_file(filepath)


if __name__ == "__main__":
    main()
