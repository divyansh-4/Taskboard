import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define the path for the tasks file
TASKS_FILE = 'tasks.json'

def load_tasks():
    # Create file with default data if it doesn't exist
    if not os.path.exists(TASKS_FILE):
        default_data = {
            "todo": [
                {"id": "1", "title": "Example Task", "description": "Try dragging me!"}
            ],
            "inProgress": [],
            "done": []
        }
        with open(TASKS_FILE, 'w') as f:
            json.dump(default_data, f)
        return default_data
    
    with open(TASKS_FILE, 'r') as f:
        return json.load(f)

def save_tasks(tasks):
    with open(TASKS_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)  # indent for better readability

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_tasks())

@app.route('/api/tasks', methods=['POST'])
def update_tasks():
    tasks = request.get_json()
    save_tasks(tasks)
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)